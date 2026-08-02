-- The wishlist is a manually ordered queue, not a feed. A column is needed because
-- the order is the user's decision and must survive a reinstall.
-- Lower priority means higher in the list.

alter table public.gametracker_games
  add column if not exists priority integer not null default 0;

-- Keep the order the wishlist had until now: newest idea on top.
with ordered as (
  select id, row_number() over (order by created_at desc) as position
  from public.gametracker_games
)
update public.gametracker_games as games
  set priority = ordered.position
  from ordered
  where games.id = ordered.id;
