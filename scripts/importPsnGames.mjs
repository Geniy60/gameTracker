// Fills the played tab from the PlayStation Network trophy list.
//
// Sony has no official public API. This goes through the same undocumented one the
// PlayStation mobile app uses, via `psn-api`, so it stays deliberately small: read
// the trophy list once, insert what is missing, stop. Run it by hand, never on a
// schedule.
//
// Usage:
//   node scripts/importPsnGames.mjs --dry-run
//   node scripts/importPsnGames.mjs --limit 10
//   node scripts/importPsnGames.mjs
//
// Only games that have a trophy list come back, so titles without one stay missing.
// PS4 and PS5 releases are separate entries and are merged by name here.

import { randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import {
  exchangeAccessCodeForAuthTokens,
  exchangeNpssoForAccessCode,
  getUserTitles,
} from 'psn-api';
import { loadEnvFiles } from './loadEnv.mjs';

// The most a single call returns. The whole list is a page or two.
const titlePageSize = 800;
const pausePerPageMs = 1000;

await loadEnvFiles();

const options = parseOptions(process.argv.slice(2));
const npsso = process.env.PSN_NPSSO;
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!npsso) {
  console.error(
    'Set PSN_NPSSO in .env.local. Sign in to your account, then open\n' +
      'https://ca.account.sony.com/api/v1/ssocookie and copy the npsso value.',
  );
  process.exit(1);
}

if (!supabaseUrl || !supabaseKey) {
  console.error(
    'Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env.local.',
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const playedTitles = await loadPlayedTitles();
console.log(`PSN returned ${playedTitles.length} titles with a trophy list.`);

const uniqueTitles = mergeByName(playedTitles);
console.log(`${uniqueTitles.length} left after merging PS4 and PS5 entries.`);

const existingGames = await loadExistingGames();
const existingKeys = new Set(existingGames.map((game) => toMatchKey(game.name)));
const missingTitles = uniqueTitles.filter(
  (title) => !existingKeys.has(toMatchKey(title.name)),
);

console.log(
  `${existingGames.length} games already in the database, ` +
    `${missingTitles.length} of the PSN titles are new.`,
);

const selectedTitles =
  options.limit === null ? missingTitles : missingTitles.slice(0, options.limit);

if (options.limit !== null) {
  console.log(`Limited to the first ${selectedTitles.length} of them.`);
}

if (selectedTitles.length === 0) {
  console.log('Nothing to import.');
  process.exit(0);
}

for (const title of selectedTitles) {
  console.log(`  ${title.name}  [${title.platform}]`);
}

if (options.dryRun) {
  console.log('\nDry run: nothing was written.');
  process.exit(0);
}

// Played games are sorted by name in the app, so the value only has to be valid
// and not disturb the wishlist queue. Appending past the highest one does both.
const highestPriority = existingGames.reduce(
  (highest, game) => Math.max(highest, game.priority),
  0,
);

// Imported as "played" rather than "finished": a trophy list says the game was
// launched, not that it was completed. It also makes new rows stand out against the
// finished ones already there, which is what a review after an import wants.
const rows = selectedTitles.map((title, index) => ({
  id: randomUUID(),
  name: title.name,
  access: 'purchased',
  progress: 'played',
  platform: 'playstation',
  priority: highestPriority + index + 1,
  rating: null,
  note: '',
  cover_url: null,
}));

const { error } = await supabase.from('gametracker_games').insert(rows);

if (error) {
  console.error(`\nInsert failed: ${error.message}`);
  process.exit(1);
}

console.log(`\nImported ${rows.length} games.`);
console.log('They have no covers: only a save from the form looks one up.');

async function loadPlayedTitles() {
  const accessToken = await authenticate();
  const titles = [];
  let offset = 0;

  while (true) {
    const response = await getUserTitles({ accessToken }, 'me', {
      limit: titlePageSize,
      offset,
    });

    titles.push(...response.trophyTitles);

    if (response.nextOffset === undefined || response.trophyTitles.length === 0) {
      break;
    }

    offset = response.nextOffset;
    await pause(pausePerPageMs);
  }

  // A hidden title was hidden on purpose. Keeping games with no trophies earned:
  // the title only appears here once it has been launched, which is what the
  // played tab means.
  return titles
    .filter((title) => !title.hiddenFlag)
    .map((title) => ({
      name: cleanTitleName(title.trophyTitleName),
      platform: title.trophyTitlePlatform,
    }));
}

async function authenticate() {
  try {
    const accessCode = await exchangeNpssoForAccessCode(npsso);
    const { accessToken } = await exchangeAccessCodeForAuthTokens(accessCode);

    return accessToken;
  } catch (error) {
    console.error(
      'PSN sign-in failed. The NPSSO token expires, so it may need to be taken\n' +
        'again from https://ca.account.sony.com/api/v1/ssocookie.',
    );
    console.error(error.message);
    process.exit(1);
  }
}

async function loadExistingGames() {
  const { data, error } = await supabase
    .from('gametracker_games')
    .select('name, priority');

  if (error) {
    console.error(`Could not read the existing games: ${error.message}`);
    process.exit(1);
  }

  return data ?? [];
}

// Keeps the first spelling seen. PSN orders by most recent trophy, so that is the
// version last played.
function mergeByName(titles) {
  const byKey = new Map();

  for (const title of titles) {
    const key = toMatchKey(title.name);

    if (!byKey.has(key)) {
      byKey.set(key, title);
    }
  }

  return [...byKey.values()];
}

// Some entries are named after the trophy set rather than the game, and come back
// as "Mortal Kombat 11 Trophies". The word has to go: the cover lookup searches by
// name, and no game is actually called that.
function cleanTitleName(name) {
  return name
    .replace(/[™®©]/g, '')
    .replace(/\s+Trophies$/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Deliberately conservative: only case, trademark marks, the curly apostrophe and
// spacing are ignored. Anything cleverer would merge "Spider-Man" with "Spider-Man
// Remastered", and a duplicate row is easier to fix by hand than a game that never
// arrived.
function toMatchKey(name) {
  return cleanTitleName(name).replace(/’/g, "'").toLowerCase();
}

function parseOptions(args) {
  const limitIndex = args.indexOf('--limit');
  const limit =
    limitIndex === -1 ? null : Number.parseInt(args[limitIndex + 1] ?? '', 10);

  if (limit !== null && (Number.isNaN(limit) || limit < 1)) {
    console.error('--limit needs a positive number, for example: --limit 10');
    process.exit(1);
  }

  return { dryRun: args.includes('--dry-run'), limit };
}

function pause(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
