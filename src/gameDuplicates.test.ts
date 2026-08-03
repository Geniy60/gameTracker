import { describe, expect, it } from 'vitest';

import { findDuplicateGame } from './gameDuplicates';
import type { Game } from './types';

function createGame(overrides: Partial<Game>): Game {
  return {
    id: 'id',
    createdAt: '2026-08-01T00:00:00Z',
    name: 'Game',
    access: null,
    progress: 'none',
    priority: 1,
    coverUrl: null,
    platform: 'playstation',
    rating: null,
    note: '',
    ...overrides,
  };
}

const played = createGame({ id: 'played', name: 'Hollow Knight', progress: 'finished' });
const wanted = createGame({ id: 'wanted', name: 'SILENT HILL 2™' });

const allGames = [played, wanted];

describe('findDuplicateGame', () => {
  it('finds a game whose name differs only in case and trademark marks', () => {
    expect(findDuplicateGame(allGames, 'Silent Hill 2', 'new')).toBe(wanted);
  });

  it('ignores repeated spaces and the curly apostrophe', () => {
    const assassins = createGame({ id: 'assassins', name: "Assassin's Creed" });

    expect(findDuplicateGame([assassins], 'Assassin’s  Creed', 'new')).toBe(assassins);
  });

  it('does not report the game being edited against itself', () => {
    expect(findDuplicateGame(allGames, 'Hollow Knight', 'played')).toBeNull();
  });

  it('keeps a differently named edition apart', () => {
    expect(findDuplicateGame(allGames, 'Hollow Knight: Silksong', 'new')).toBeNull();
  });
});
