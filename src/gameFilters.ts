import type { Game, MainTab } from './types';

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

// Where to send the user after a save that moved the game out of the current tab.
export function findTabForGame(game: Game): MainTab {
  if (game.access !== null) {
    return 'available';
  }

  return game.isPlayed ? 'played' : 'wishlist';
}
