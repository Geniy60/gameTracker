import type { Game, GameStatus } from './types';

export type RootStackParamList = {
  Home: undefined;
  GameForm: { game: Game | null; initialStatus: GameStatus };
};
