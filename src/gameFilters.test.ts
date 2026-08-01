import { describe, expect, it } from 'vitest';

import { filterGamesByTab, findTabForGame } from './gameFilters';
import type { Game } from './types';

function createGame(overrides: Partial<Game>): Game {
  return {
    id: 'id',
    name: 'Game',
    access: null,
    isPlayed: false,
    platform: 'playstation',
    rating: null,
    note: '',
    ...overrides,
  };
}

const wanted = createGame({ id: 'wanted', access: null, isPlayed: false });
const ownedUnplayed = createGame({ id: 'owned', access: 'purchased' });
const ownedPlayed = createGame({ id: 'owned-played', access: 'purchased', isPlayed: true });
const lostAccessPlayed = createGame({ id: 'lost', access: null, isPlayed: true });

const allGames = [wanted, ownedUnplayed, ownedPlayed, lostAccessPlayed];

describe('filterGamesByTab', () => {
  it('shows only games without access that were never played as wanted', () => {
    expect(filterGamesByTab(allGames, 'wishlist')).toEqual([wanted]);
  });

  it('keeps a played game in the available list while access remains', () => {
    expect(filterGamesByTab(allGames, 'available')).toEqual([ownedUnplayed, ownedPlayed]);
  });

  it('keeps a played game in the played list after access is lost', () => {
    expect(filterGamesByTab(allGames, 'played')).toEqual([ownedPlayed, lostAccessPlayed]);
  });
});

describe('findTabForGame', () => {
  it('prefers the available tab whenever access exists', () => {
    expect(findTabForGame(ownedPlayed)).toBe('available');
  });

  it('falls back to the played tab when access is gone', () => {
    expect(findTabForGame(lostAccessPlayed)).toBe('played');
  });

  it('uses the wanted tab for a game that is neither owned nor played', () => {
    expect(findTabForGame(wanted)).toBe('wishlist');
  });
});
