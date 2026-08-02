import { describe, expect, it } from 'vitest';

import { nextPriority, reorderPriorities } from './gameOrder';
import type { Game } from './types';

function createGame(id: string, priority: number): Game {
  return {
    id,
    createdAt: '2026-08-01T00:00:00Z',
    name: id,
    access: null,
    isPlayed: false,
    priority,
    platform: 'playstation',
    rating: null,
    note: '',
  };
}

describe('nextPriority', () => {
  it('puts a new game after everything else', () => {
    expect(nextPriority([createGame('a', 1), createGame('b', 4)])).toBe(5);
  });

  it('starts at one for the first game', () => {
    expect(nextPriority([])).toBe(1);
  });
});

describe('reorderPriorities', () => {
  const first = createGame('first', 1);
  const second = createGame('second', 2);
  const third = createGame('third', 3);

  it('moves a game up and shifts the ones it passed', () => {
    expect(reorderPriorities([first, second, third], 2, 0)).toEqual([
      { id: 'third', priority: 1 },
      { id: 'first', priority: 2 },
      { id: 'second', priority: 3 },
    ]);
  });

  it('reports nothing when the game lands where it started', () => {
    expect(reorderPriorities([first, second, third], 1, 1)).toEqual([]);
  });

  it('only reuses the values of the visible games, so hidden ones stay put', () => {
    const visible = [createGame('a', 2), createGame('b', 5)];

    expect(reorderPriorities(visible, 1, 0)).toEqual([
      { id: 'b', priority: 2 },
      { id: 'a', priority: 5 },
    ]);
  });
});
