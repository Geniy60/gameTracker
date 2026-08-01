alter table public.gametracker_games
  drop constraint if exists gametracker_games_status_check;

alter table public.gametracker_games
  add constraint gametracker_games_status_check check (
    status in ('wishlist', 'available', 'played')
  );

alter table public.gametracker_games
  add column if not exists access text;

alter table public.gametracker_games
  drop constraint if exists gametracker_games_access_check;

alter table public.gametracker_games
  add constraint gametracker_games_access_check check (
    access is null or access in ('purchased', 'friend', 'subscription')
  );

-- A wishlist game is one the user has no access to yet, so the two cannot coexist.
alter table public.gametracker_games
  drop constraint if exists gametracker_games_access_status_check;

alter table public.gametracker_games
  add constraint gametracker_games_access_status_check check (
    access is null or status <> 'wishlist'
  );
