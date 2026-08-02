// Covers come from SteamGridDB, which needs nothing but a read key in a header.
// Everything here fails quietly: a game without a cover is a normal game, so a
// lookup that does not work must never get in the way of saving one.

const apiBaseUrl = 'https://www.steamgriddb.com/api/v2';
const apiKey = process.env.EXPO_PUBLIC_STEAMGRIDDB_API_KEY;

// 600x900 is the portrait box art size. Static only, and the community flags for
// adult and joke artwork are filtered out.
const coverQuery = 'dimensions=600x900&types=static&nsfw=false&humor=false&limit=1';

type SearchResponse = { data?: { id?: number }[] };
type CoversResponse = { data?: { thumb?: string }[] };

export async function findCoverUrl(gameName: string): Promise<string | null> {
  if (apiKey === undefined) {
    return null;
  }

  const gameId = await requestJson<SearchResponse>(
    `${apiBaseUrl}/search/autocomplete/${encodeURIComponent(gameName)}`,
  ).then((response) => response?.data?.[0]?.id);

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

async function requestJson<T>(url: string): Promise<T | null> {
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
