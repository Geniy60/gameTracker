import type { Game, MainTab } from './types';

export function selectGamesForTab(games: Game[], tab: MainTab): Game[] {
  return sortGamesForTab(filterGamesByTab(games, tab), tab);
}

export function filterGamesByTab(games: Game[], tab: MainTab): Game[] {
  if (tab === 'available') {
    return games.filter((game) => game.access !== null);
  }

  if (tab === 'played') {
    return games.filter((game) => game.isPlayed);
  }

  // Wanted: no access yet and not played. A played game does not come back here
  // when its access is lost.
  return games.filter((game) => game.access === null && !game.isPlayed);
}

// The wishlist is a queue, so the newest idea belongs on top. The other two tabs are
// reference lists where a name is the fastest way to find something.
function sortGamesForTab(games: Game[], tab: MainTab): Game[] {
  if (tab === 'wishlist') {
    return [...games].sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  }

  return [...games].sort((left, right) => left.name.localeCompare(right.name, 'ru'));
}

// Where to send the user after a save that moved the game out of the current tab.
export function findTabForGame(game: Game): MainTab {
  if (game.access !== null) {
    return 'available';
  }

  return game.isPlayed ? 'played' : 'wishlist';
}
