import type { Game } from './types';

export type QuickStepKind = 'markOwned' | 'markPlayed';

export type QuickStep = {
  game: Game;
  kind: QuickStepKind;
};

// The one obvious next move for a game, offered as a single tap on its row.
// A game that is both owned and played has no next move, so it gets no button.
export function createQuickStep(game: Game): QuickStep | null {
  if (game.isPlayed) {
    return null;
  }

  if (game.access === null) {
    return { game: { ...game, access: 'purchased' }, kind: 'markOwned' };
  }

  return { game: { ...game, isPlayed: true }, kind: 'markPlayed' };
}
