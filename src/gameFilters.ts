import type { Game, MainTab, WishlistFilter } from './types';

export function selectGamesForTab(games: Game[], tab: MainTab): Game[] {
  return sortGamesForTab(filterGamesByTab(games, tab), tab);
}

export function filterGamesByTab(games: Game[], tab: MainTab): Game[] {
  if (tab === 'played') {
    return games.filter((game) => game.isPlayed);
  }

  // Everything still worth playing, owned or not. Ownership is a filter on top.
  return games.filter((game) => !game.isPlayed);
}

// The ownership filter inside the wishlist.
export function filterWishlistGames(games: Game[], filter: WishlistFilter): Game[] {
  if (filter === 'owned') {
    return games.filter((game) => game.access !== null);
  }

  if (filter === 'toBuy') {
    return games.filter((game) => game.access === null);
  }

  return games;
}

// The wishlist order is the user's own, so it follows priority. The played list is a
// reference list where a name is the fastest way to find something.
function sortGamesForTab(games: Game[], tab: MainTab): Game[] {
  if (tab === 'played') {
    return [...games].sort((left, right) => left.name.localeCompare(right.name, 'ru'));
  }

  return [...games].sort(
    (left, right) =>
      left.priority - right.priority || right.createdAt.localeCompare(left.createdAt),
  );
}

// Where to send the user after a save that moved the game out of the current tab.
export function findTabForGame(game: Game): MainTab {
  return game.isPlayed ? 'played' : 'wishlist';
}
