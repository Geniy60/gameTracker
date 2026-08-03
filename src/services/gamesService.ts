import type { PriorityUpdate } from '../gameOrder';
import { supabase } from '../supabaseClient';
import type { Game } from '../types';

export async function loadGames(): Promise<Game[]> {
  const { data, error } = await supabase
    .from('gametracker_games')
    .select(
      'id, created_at, name, access, progress, priority, cover_url, platform, rating, note',
    );

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    createdAt: row.created_at,
    name: row.name,
    access: row.access,
    progress: row.progress,
    priority: row.priority,
    coverUrl: row.cover_url,
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
    cover_url: game.coverUrl,
    id: game.id,
    name: game.name,
    note: game.note,
    platform: game.platform,
    priority: game.priority,
    progress: game.progress,
    rating: game.progress === 'none' ? null : game.rating,
  });

  if (error) {
    throw error;
  }
}

export async function saveGameCover(id: string, coverUrl: string): Promise<void> {
  const { error } = await supabase
    .from('gametracker_games')
    .update({ cover_url: coverUrl })
    .eq('id', id);

  if (error) {
    throw error;
  }
}

// One call rather than an update per row. A drag from the bottom of the wishlist
// moves every row above it, and as separate requests that was dozens of them, with
// nothing holding them together if one failed. The database function applies the
// whole order in a single statement.
//
// An upsert would not do: a payload carrying only id and priority is rejected as an
// insert against the not-null columns.
export async function saveGamePriorities(updates: PriorityUpdate[]): Promise<void> {
  const { error } = await supabase.rpc('gametracker_set_priorities', { updates });

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
