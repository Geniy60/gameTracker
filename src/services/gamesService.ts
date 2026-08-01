import { supabase } from '../supabaseClient';
import type { Game } from '../types';

export async function loadGames(): Promise<Game[]> {
  const { data, error } = await supabase
    .from('gametracker_games')
    .select('id, created_at, name, access, is_played, platform, rating, note');

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    createdAt: row.created_at,
    name: row.name,
    access: row.access,
    isPlayed: row.is_played,
    platform: row.platform,
    rating: row.rating,
    note: row.note,
  }));
}

// createdAt is deliberately not sent: the column default owns it on insert, and
// leaving it out of the update keeps the original value on edit.
export async function saveGame(game: Game): Promise<void> {
  const { error } = await supabase.from('gametracker_games').upsert({
    access: game.access,
    id: game.id,
    is_played: game.isPlayed,
    name: game.name,
    note: game.note,
    platform: game.platform,
    rating: game.isPlayed ? game.rating : null,
  });

  if (error) {
    throw error;
  }
}

export async function deleteGame(id: string): Promise<void> {
  const { error } = await supabase.from('gametracker_games').delete().eq('id', id);

  if (error) {
    throw error;
  }
}
