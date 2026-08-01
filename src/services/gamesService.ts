import { supabase } from '../supabaseClient';
import type { Game } from '../types';

export async function loadGames(): Promise<Game[]> {
  const { data, error } = await supabase
    .from('gametracker_games')
    .select('id, name, access, is_played, platform, rating, note')
    .order('name', { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    access: row.access,
    isPlayed: row.is_played,
    platform: row.platform,
    rating: row.rating,
    note: row.note,
  }));
}

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
