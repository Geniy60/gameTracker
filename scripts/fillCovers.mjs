// Fills cover_url for games that have none.
//
// The app looks a cover up only after a save from the form, so rows written by the
// PSN import have none and would never get one. This is the same two requests the
// app makes, in a loop over the rows that are still empty.
//
// Usage:
//   node scripts/fillCovers.mjs --dry-run
//   node scripts/fillCovers.mjs --limit 10
//   node scripts/fillCovers.mjs
//
// Only empty covers are touched, so the script is resumable: stopping it, or being
// stopped by the service, costs nothing but a rerun.

import { createClient } from '@supabase/supabase-js';
import { loadEnvFiles } from './loadEnv.mjs';

// Deliberately a copy of what src/services/steamGridDb.ts sends. Sharing it would
// mean compiling the app's TypeScript for a script, which is not worth it, but the
// two must keep asking for the same picture.
const apiBaseUrl = 'https://www.steamgriddb.com/api/v2';
const coverQuery = 'dimensions=600x900&types=static&nsfw=false&humor=false&limit=1';

// Two requests per game against someone else's free service. A second between
// games keeps it slower than a person browsing the site.
const pausePerGameMs = 1000;

// How many search matches are tried before giving up on a game.
const maxSearchCandidates = 3;

await loadEnvFiles();

const options = parseOptions(process.argv.slice(2));
const apiKey = process.env.EXPO_PUBLIC_STEAMGRIDDB_API_KEY;
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!apiKey) {
  console.error('Set EXPO_PUBLIC_STEAMGRIDDB_API_KEY in .env.local.');
  process.exit(1);
}

if (!supabaseUrl || !supabaseKey) {
  console.error(
    'Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env.local.',
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const gamesWithoutCover = await loadGamesWithoutCover();
console.log(`${gamesWithoutCover.length} games have no cover.`);

const selectedGames =
  options.limit === null
    ? gamesWithoutCover
    : gamesWithoutCover.slice(0, options.limit);

if (options.limit !== null) {
  console.log(`Limited to the first ${selectedGames.length} of them.`);
}

if (selectedGames.length === 0) {
  console.log('Nothing to do.');
  process.exit(0);
}

if (options.dryRun) {
  for (const game of selectedGames) {
    console.log(`  ${game.name}`);
  }

  console.log('\nDry run: nothing was requested or written.');
  process.exit(0);
}

let foundCount = 0;
let missingCount = 0;

for (const [index, game] of selectedGames.entries()) {
  if (index > 0) {
    await pause(pausePerGameMs);
  }

  const coverUrl = await findCoverUrl(game.name);

  if (coverUrl === null) {
    missingCount += 1;
    console.log(`  no cover   ${game.name}`);
    continue;
  }

  const { error } = await supabase
    .from('gametracker_games')
    .update({ cover_url: coverUrl })
    .eq('id', game.id);

  if (error) {
    console.error(`\nCould not save the cover for ${game.name}: ${error.message}`);
    process.exit(1);
  }

  foundCount += 1;
  console.log(`  ok         ${game.name}`);
}

console.log(`\n${foundCount} covers saved, ${missingCount} not found.`);

if (missingCount > 0) {
  console.log('A game whose cover was not found keeps the placeholder.');
}

async function loadGamesWithoutCover() {
  const { data, error } = await supabase
    .from('gametracker_games')
    .select('id, name')
    .is('cover_url', null)
    .order('name');

  if (error) {
    console.error(`Could not read the games: ${error.message}`);
    process.exit(1);
  }

  return data ?? [];
}

async function findCoverUrl(gameName) {
  const search = await requestJson(
    `${apiBaseUrl}/search/autocomplete/${encodeURIComponent(gameName)}`,
  );
  const candidates = (search?.data ?? []).slice(0, maxSearchCandidates);

  // The first match is not always a game: searching for Space Marine 2 puts its mod
  // tools first, and those have no box art. Trying the next matches costs a request
  // only when the one before found nothing.
  for (const candidate of candidates) {
    if (candidate.id === undefined) {
      continue;
    }

    const covers = await requestJson(
      `${apiBaseUrl}/grids/game/${candidate.id}?${coverQuery}`,
    );
    // The thumbnail, not the full picture: the list draws it 88 wide.
    const coverUrl = covers?.data?.[0]?.thumb;

    if (coverUrl !== undefined) {
      return coverUrl;
    }
  }

  return null;
}

// A refusal ends the run instead of being retried. Hammering a service that has
// just said no is how a read-only key gets itself blocked, and stopping here is
// free because the next run picks up the rows that are still empty.
async function requestJson(url) {
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  if (response.status === 429 || response.status === 403) {
    console.error(
      `\nSteamGridDB answered ${response.status}. Stopping rather than retrying.`,
    );
    console.error('Wait a while, then run the script again to continue.');
    process.exit(1);
  }

  if (!response.ok) {
    return null;
  }

  return response.json();
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
