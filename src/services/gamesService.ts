import { supabase } from '../supabaseClient';
import type { Game } from '../types';

export async function loadGames(): Promise<Game[]> {
  const { data, error } = await supabase
    .from('gametracker_games')
    .select('id, name, status, access, platform, rating, note')
    .order('name', { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function saveGame(game: Game): Promise<void> {
  const { error } = await supabase.from('gametracker_games').upsert({
    access: game.status === 'wishlist' ? null : game.access,
    id: game.id,
    name: game.name,
    note: game.note,
    platform: game.platform,
    rating: game.status === 'played' ? game.rating : null,
    status: game.status,
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
