export type GameStatus = 'wishlist' | 'played';

export type MainTab = GameStatus;

export type GamePlatform =
  | 'pc'
  | 'playstation'
  | 'xbox'
  | 'switch'
  | 'mobile'
  | 'other';

export type Game = {
  id: string;
  name: string;
  status: GameStatus;
  platform: GamePlatform;
  rating: number | null;
  note: string;
};
