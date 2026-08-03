import type { Game } from './types';

// The same conservative rule the PSN import script matches names by: case,
// trademark marks, the curly apostrophe and repeated spaces are ignored, and
// nothing else. Anything cleverer would call "Spider-Man" and "Spider-Man
// Remastered" the same game, and a missed duplicate costs far less than a warning
// about a game the user does not own.
export function toGameNameKey(name: string): string {
  return name
    .replace(/[™®©]/g, '')
    .replace(/’/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

// The game already in the list under the name being saved, if there is one. The
// game being saved is skipped by its own id, so editing a note and saving does not
// report the game against itself.
export function findDuplicateGame(
  games: Game[],
  name: string,
  savedGameId: string,
): Game | null {
  const key = toGameNameKey(name);

  return (
    games.find((game) => game.id !== savedGameId && toGameNameKey(game.name) === key) ??
    null
  );
}
