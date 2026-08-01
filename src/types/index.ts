export type GameStatus = 'wishlist' | 'played';

export type MainTab = GameStatus;

// Only PlayStation is used right now. To add a platform later, extend this union
// and the two lists in gamePlatforms.ts and strings.platforms. The database check
// constraint already allows 'pc', 'xbox', 'switch', 'mobile', and 'other'.
export type GamePlatform = 'playstation';

export type Game = {
  id: string;
  name: string;
  status: GameStatus;
  platform: GamePlatform;
  rating: number | null;
  note: string;
};
