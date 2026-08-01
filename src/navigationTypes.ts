import type { Game, MainTab } from './types';

export type RootStackParamList = {
  Home: undefined;
  // The tab the user pressed "add" from decides the new game's defaults.
  GameForm: { game: Game | null; sourceTab: MainTab };
};
