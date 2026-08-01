import type { GamePlatform, GameStatus } from './types';

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
          created_at: string;
          id: string;
          name: string;
          note: string;
          platform: GamePlatform;
          rating: number | null;
          status: GameStatus;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          note?: string;
          platform?: GamePlatform;
          rating?: number | null;
          status: GameStatus;
        };
        Update: {
          name?: string;
          note?: string;
          platform?: GamePlatform;
          rating?: number | null;
          status?: GameStatus;
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
