// The wishlist is the main list: everything the user still wants to play, owned or
// not. Ownership is a filter inside it, not a separate tab.
export type MainTab = 'wishlist' | 'played';

// Ownership filter over the wishlist. 'owned' means the game is reachable right
// now, 'toBuy' means it is not.
export type WishlistFilter = 'all' | 'owned' | 'toBuy';

// How the user can reach the game right now. null means no access at all.
export type GameAccess = 'purchased' | 'friend' | 'subscription';

// Only PlayStation is used right now. To add a platform later, extend this union
// and the two lists in gamePlatforms.ts and strings.platforms. The database check
// constraint already allows 'pc', 'xbox', 'switch', 'mobile', and 'other'.
export type GamePlatform = 'playstation';

export type Game = {
  id: string;
  // Owned by the database. The app reads it only to break priority ties.
  createdAt: string;
  name: string;
  access: GameAccess | null;
  isPlayed: boolean;
  // Manual wishlist order. Lower means higher in the list.
  priority: number;
  // Address of the cover picture, or null while the game has none.
  coverUrl: string | null;
  platform: GamePlatform;
  rating: number | null;
  note: string;
};
