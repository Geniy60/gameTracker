import type { GameAccess, GamePlatform } from './types';

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
          is_played: boolean;
          name: string;
          note: string;
          platform: GamePlatform;
          priority: number;
          rating: number | null;
          updated_at: string;
        };
        Insert: {
          access?: GameAccess | null;
          cover_url?: string | null;
          id: string;
          is_played?: boolean;
          name: string;
          note?: string;
          platform?: GamePlatform;
          priority?: number;
          rating?: number | null;
        };
        Update: {
          access?: GameAccess | null;
          cover_url?: string | null;
          is_played?: boolean;
          name?: string;
          note?: string;
          platform?: GamePlatform;
          priority?: number;
          rating?: number | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, Json>;
  };
};
