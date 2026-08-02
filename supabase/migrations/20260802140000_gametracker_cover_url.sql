-- Where a game's cover picture lives. Nullable: most games will not have one for a
-- while, and the list falls back to a placeholder.

alter table public.gametracker_games
  add column if not exists cover_url text;
