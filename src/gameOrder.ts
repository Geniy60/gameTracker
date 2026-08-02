import type { Game } from './types';

export type PriorityUpdate = { id: string; priority: number };

// A new game joins the end of the queue: a fresh idea should not push aside what the
// user already decided to play next.
export function nextPriority(games: Game[]): number {
  return games.reduce((highest, game) => Math.max(highest, game.priority), 0) + 1;
}

// Dragging is only offered on the whole wishlist, never on a filtered or searched
// one, since moving a row past invisible neighbours gives a result the drag did not
// describe. Played games still hold priority values though, so the reordering reuses
// the values the wishlist games already occupy rather than renumbering from one.
export function reorderPriorities(
  visibleGames: Game[],
  fromIndex: number,
  toIndex: number,
): PriorityUpdate[] {
  const reordered = moveGame(visibleGames, fromIndex, toIndex);
  const values = visibleGames.map((game) => game.priority).sort((left, right) => left - right);

  return reordered.flatMap((game, index) => {
    const priority = values[index];

    if (priority === undefined || priority === game.priority) {
      return [];
    }

    return [{ id: game.id, priority }];
  });
}

function moveGame(games: Game[], fromIndex: number, toIndex: number): Game[] {
  const moved = [...games];
  const [game] = moved.splice(fromIndex, 1);

  if (game === undefined) {
    return games;
  }

  moved.splice(toIndex, 0, game);

  return moved;
}
