import type { GamePlatform } from './types';

export const gamePlatforms: GamePlatform[] = ['playstation'];

export const defaultGamePlatform: GamePlatform = 'playstation';

// The platform picker and the platform label on cards are pointless while every
// game is on the same platform. Both appear again as soon as gamePlatforms grows.
export function hasMultiplePlatforms(): boolean {
  return gamePlatforms.length > 1;
}
