import { describe, expect, it } from 'vitest';

import {
  filterGamesByTab,
  filterPlayedGames,
  filterWishlistGames,
  findTabForGame,
  selectGamesForTab,
} from './gameFilters';
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

const wanted = createGame({ id: 'wanted', access: null, progress: 'none' });
const ownedUnplayed = createGame({ id: 'owned', access: 'purchased' });
const ownedPlayed = createGame({
  id: 'owned-played',
  access: 'purchased',
  progress: 'played',
});
const lostAccessFinished = createGame({ id: 'lost', access: null, progress: 'finished' });

const allGames = [wanted, ownedUnplayed, ownedPlayed, lostAccessFinished];

describe('filterGamesByTab', () => {
  it('keeps every unplayed game in the wishlist, owned or not', () => {
    expect(filterGamesByTab(allGames, 'wishlist')).toEqual([wanted, ownedUnplayed]);
  });

  it('keeps a played game in the played list after access is lost', () => {
    expect(filterGamesByTab(allGames, 'played')).toEqual([ownedPlayed, lostAccessFinished]);
  });
});

describe('filterWishlistGames', () => {
  const wishlist = [wanted, ownedUnplayed];

  it('shows everything by default', () => {
    expect(filterWishlistGames(wishlist, 'all')).toEqual(wishlist);
  });

  it('shows only reachable games as owned', () => {
    expect(filterWishlistGames(wishlist, 'owned')).toEqual([ownedUnplayed]);
  });

  it('shows only games without access as to buy', () => {
    expect(filterWishlistGames(wishlist, 'toBuy')).toEqual([wanted]);
  });
});

describe('filterPlayedGames', () => {
  const played = [ownedPlayed, lostAccessFinished];

  it('shows everything by default', () => {
    expect(filterPlayedGames(played, 'all')).toEqual(played);
  });

  it('shows only finished games', () => {
    expect(filterPlayedGames(played, 'finished')).toEqual([lostAccessFinished]);
  });

  it('shows only games that were started and left', () => {
    expect(filterPlayedGames(played, 'unfinished')).toEqual([ownedPlayed]);
  });
});

describe('selectGamesForTab', () => {
  const first = createGame({ id: 'first', name: 'Z', priority: 1 });
  const second = createGame({ id: 'second', name: 'A', priority: 2 });

  it('follows the manual priority in the wishlist', () => {
    expect(selectGamesForTab([second, first], 'wishlist').map((game) => game.id)).toEqual([
      'first',
      'second',
    ]);
  });

  it('breaks a priority tie with the newest game on top', () => {
    const older = createGame({ id: 'older', createdAt: '2026-01-01T00:00:00Z', priority: 0 });
    const newer = createGame({ id: 'newer', createdAt: '2026-07-01T00:00:00Z', priority: 0 });

    expect(selectGamesForTab([older, newer], 'wishlist').map((game) => game.id)).toEqual([
      'newer',
      'older',
    ]);
  });

  it('sorts the played tab by name', () => {
    const zebra = createGame({ id: 'zebra', progress: 'finished', name: 'Zebra' });
    const apple = createGame({ id: 'apple', progress: 'finished', name: 'Apple' });

    expect(selectGamesForTab([zebra, apple], 'played').map((game) => game.id)).toEqual([
      'apple',
      'zebra',
    ]);
  });

  it('does not mutate the games it was given', () => {
    const games = [second, first];

    selectGamesForTab(games, 'wishlist');

    expect(games.map((game) => game.id)).toEqual(['second', 'first']);
  });
});

describe('findTabForGame', () => {
  it('sends a played game to the played tab whether it is owned or not', () => {
    expect(findTabForGame(ownedPlayed)).toBe('played');
    expect(findTabForGame(lostAccessFinished)).toBe('played');
  });

  it('keeps an unplayed game in the wishlist even when it is owned', () => {
    expect(findTabForGame(wanted)).toBe('wishlist');
    expect(findTabForGame(ownedUnplayed)).toBe('wishlist');
  });
});
