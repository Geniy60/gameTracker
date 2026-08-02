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

// Plain updates rather than one upsert: an upsert payload without the required
// columns would be rejected as an insert.
export async function saveGamePriorities(updates: PriorityUpdate[]): Promise<void> {
  const results = await Promise.all(
    updates.map((update) =>
      supabase
        .from('gametracker_games')
        .update({ priority: update.priority })
        .eq('id', update.id),
    ),
  );

  const failed = results.find((result) => result.error !== null);

  if (failed?.error) {
    throw failed.error;
  }
}

export async function deleteGame(id: string): Promise<void> {
  const { error } = await supabase.from('gametracker_games').delete().eq('id', id);

  if (error) {
    throw error;
  }
}
