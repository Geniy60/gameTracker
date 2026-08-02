import { describe, expect, it } from 'vitest';

import { createQuickStep } from './gameActions';
import type { Game } from './types';

function createGame(overrides: Partial<Game>): Game {
  return {
    id: 'id',
    createdAt: '2026-08-01T00:00:00Z',
    name: 'Game',
    access: null,
    isPlayed: false,
    priority: 1,
    platform: 'playstation',
    rating: null,
    note: '',
    ...overrides,
  };
}

describe('createQuickStep', () => {
  it('offers buying a wanted game', () => {
    const step = createQuickStep(createGame({}));

    expect(step?.kind).toBe('markOwned');
    expect(step?.game.access).toBe('purchased');
    expect(step?.game.isPlayed).toBe(false);
  });

  it('offers marking an owned game as played', () => {
    const step = createQuickStep(createGame({ access: 'subscription' }));

    expect(step?.kind).toBe('markPlayed');
    expect(step?.game.isPlayed).toBe(true);
  });

  it('keeps the existing access when marking as played', () => {
    expect(createQuickStep(createGame({ access: 'friend' }))?.game.access).toBe('friend');
  });

  it('offers nothing once a game is played', () => {
    expect(createQuickStep(createGame({ access: 'purchased', isPlayed: true }))).toBeNull();
    expect(createQuickStep(createGame({ isPlayed: true }))).toBeNull();
  });
});
