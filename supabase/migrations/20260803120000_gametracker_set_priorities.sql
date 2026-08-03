-- Reordering the wishlist was one request per row that moved. Dragging a game from
-- the bottom of 74 rows shifts every row above it, so that was 74 parallel updates,
-- and a failure halfway through left the order half written while the app had
-- already drawn the new one.
--
-- One function takes the whole new order instead. It is a single SQL statement, so
-- either every row moves or none does, and the app makes one request.

create or replace function public.gametracker_set_priorities(updates jsonb)
returns void
language sql
security invoker
set search_path = public
as $$
  update public.gametracker_games as game
  set priority = entry.priority
  from jsonb_to_recordset(updates) as entry(id text, priority integer)
  where game.id = entry.id;
$$;

-- The app talks to the database with the anon key, as everything else here does.
grant execute on function public.gametracker_set_priorities(jsonb) to anon, authenticated;

-- PostgREST only exposes what its schema cache knows about.
notify pgrst, 'reload schema';
