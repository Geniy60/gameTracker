import { describe, expect, it } from 'vitest';

import { createGameActions } from './gameActions';
import type { Game } from './types';

function createGame(overrides: Partial<Game>): Game {
  return {
    id: 'id',
    createdAt: '2026-08-01T00:00:00Z',
    name: 'Game',
    access: null,
    isPlayed: false,
    priority: 1,
    coverUrl: null,
    platform: 'playstation',
    rating: null,
    note: '',
    ...overrides,
  };
}

describe('createGameActions', () => {
  it('offers buying and playing a game that is neither owned nor played', () => {
    const actions = createGameActions(createGame({}));

    expect(actions.map((action) => action.kind)).toEqual(['markOwned', 'markPlayed']);
  });

  it('drops only the buying action once the game is owned', () => {
    const actions = createGameActions(createGame({ access: 'subscription' }));

    expect(actions.map((action) => action.kind)).toEqual(['markPlayed']);
  });

  it('applies the change to the game it hands back', () => {
    const [buy, play] = createGameActions(createGame({}));

    expect(buy?.game.access).toBe('purchased');
    expect(buy?.game.isPlayed).toBe(false);
    expect(play?.game.isPlayed).toBe(true);
  });

  it('keeps the existing access when marking as played', () => {
    const [play] = createGameActions(createGame({ access: 'friend' }));

    expect(play?.game.access).toBe('friend');
  });

  it('offers nothing once a game is played', () => {
    expect(createGameActions(createGame({ access: 'purchased', isPlayed: true }))).toEqual([]);
    expect(createGameActions(createGame({ isPlayed: true }))).toEqual([]);
  });
});
