// SteamGridDB needs nothing but a read key in a header. Everything here fails
// quietly: a game without a cover is a normal game, and a title the user typed by
// hand is a valid title, so neither lookup may get in the way of saving.

const apiBaseUrl = 'https://www.steamgriddb.com/api/v2';
const apiKey = process.env.EXPO_PUBLIC_STEAMGRIDDB_API_KEY;

// 600x900 is the portrait box art size. Static only, and the community flags for
// adult and joke artwork are filtered out.
const coverQuery = 'dimensions=600x900&types=static&nsfw=false&humor=false&limit=1';

// How many title suggestions the form offers. Enough to find the right edition,
// short enough not to push the rest of the form off screen.
const maxTitleSuggestions = 5;

type SearchResponse = { data?: { id?: number; name?: string }[] };
type CoversResponse = { data?: { thumb?: string }[] };

// Suggestions while the game name is being typed. Getting the exact title is what
// makes the cover lookup that follows the save find the right game.
export async function findGameTitles(term: string): Promise<string[]> {
  const response = await searchGames(term);
  const titles = (response?.data ?? [])
    .map((game) => game.name)
    .filter((name): name is string => name !== undefined);

  return [...new Set(titles)].slice(0, maxTitleSuggestions);
}

export async function findCoverUrl(gameName: string): Promise<string | null> {
  const gameId = await searchGames(gameName).then(
    (response) => response?.data?.[0]?.id,
  );

  if (gameId === undefined) {
    return null;
  }

  const covers = await requestJson<CoversResponse>(
    `${apiBaseUrl}/grids/game/${gameId}?${coverQuery}`,
  );

  // The thumbnail rather than the full picture: it is only ever drawn as a small
  // square in a list row.
  return covers?.data?.[0]?.thumb ?? null;
}

function searchGames(term: string): Promise<SearchResponse | null> {
  return requestJson<SearchResponse>(
    `${apiBaseUrl}/search/autocomplete/${encodeURIComponent(term)}`,
  );
}

async function requestJson<T>(url: string): Promise<T | null> {
  if (apiKey === undefined) {
    return null;
  }

  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch {
    return null;
  }
}
