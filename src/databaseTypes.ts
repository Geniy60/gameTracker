import type { GameAccess, GamePlatform, GameProgress } from './types';

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export type Database = {
  public: {
    Tables: {
      gametracker_games: {
        Row: {
          access: GameAccess | null;
          cover_url: string | null;
          created_at: string;
          id: string;
          name: string;
          note: string;
          platform: GamePlatform;
          priority: number;
          progress: GameProgress;
          rating: number | null;
          updated_at: string;
        };
        Insert: {
          access?: GameAccess | null;
          cover_url?: string | null;
          id: string;
          name: string;
          note?: string;
          platform?: GamePlatform;
          priority?: number;
          progress?: GameProgress;
          rating?: number | null;
        };
        Update: {
          access?: GameAccess | null;
          cover_url?: string | null;
          name?: string;
          note?: string;
          platform?: GamePlatform;
          priority?: number;
          progress?: GameProgress;
          rating?: number | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      // Takes the whole new wishlist order as [{ id, priority }, ...] and applies it
      // in one statement.
      gametracker_set_priorities: {
        Args: { updates: Json };
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, Json>;
  };
};
