import type { Game } from './types';

export type GameActionKind = 'markOwned' | 'markPlayed';

export type GameAction = {
  // The game with the change already applied, ready to be saved.
  game: Game;
  kind: GameActionKind;
};

// The actions a game still has ahead of it, in a fixed order. There used to be a
// single button that changed its meaning after every tap, which made two taps in the
// same spot do two different things. Each action now means one thing only, and a
// game simply leaves out the ones that no longer apply.
export function createGameActions(game: Game): GameAction[] {
  if (game.isPlayed) {
    return [];
  }

  const actions: GameAction[] = [];

  if (game.access === null) {
    actions.push({ game: { ...game, access: 'purchased' }, kind: 'markOwned' });
  }

  actions.push({ game: { ...game, isPlayed: true }, kind: 'markPlayed' });

  return actions;
}
