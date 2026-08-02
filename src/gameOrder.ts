import type { Game } from './types';

export type PriorityUpdate = { id: string; priority: number };

// A new game joins the end of the queue: a fresh idea should not push aside what the
// user already decided to play next.
export function nextPriority(games: Game[]): number {
  return games.reduce((highest, game) => Math.max(highest, game.priority), 0) + 1;
}

// Dragging happens inside the list the user sees, which the ownership filter and the
// search box can narrow. Reusing the priority values the visible games already occupy
// keeps every hidden game exactly where it was.
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
