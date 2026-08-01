// Access and isPlayed are independent. The tabs are filters over them, not a status:
// a game stays in the available list after it is played, and a played game whose
// access is gone stays in the played list.
export type MainTab = 'wishlist' | 'available' | 'played';

// How the user can reach the game right now. null means no access at all.
export type GameAccess = 'purchased' | 'friend' | 'subscription';

// Only PlayStation is used right now. To add a platform later, extend this union
// and the two lists in gamePlatforms.ts and strings.platforms. The database check
// constraint already allows 'pc', 'xbox', 'switch', 'mobile', and 'other'.
export type GamePlatform = 'playstation';

export type Game = {
  id: string;
  // Owned by the database. The app reads it for sorting but never writes it.
  createdAt: string;
  name: string;
  access: GameAccess | null;
  isPlayed: boolean;
  platform: GamePlatform;
  rating: number | null;
  note: string;
};
