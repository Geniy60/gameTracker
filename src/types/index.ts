// The three statuses are one lifecycle: wanted, then available, then played.
export type GameStatus = 'wishlist' | 'available' | 'played';

export type MainTab = GameStatus;

// How the user can reach the game. Wishlist games have no access by definition.
export type GameAccess = 'purchased' | 'friend' | 'subscription';

// Only PlayStation is used right now. To add a platform later, extend this union
// and the two lists in gamePlatforms.ts and strings.platforms. The database check
// constraint already allows 'pc', 'xbox', 'switch', 'mobile', and 'other'.
export type GamePlatform = 'playstation';

export type Game = {
  id: string;
  name: string;
  status: GameStatus;
  access: GameAccess | null;
  platform: GamePlatform;
  rating: number | null;
  note: string;
};
