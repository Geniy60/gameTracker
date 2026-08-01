-- Access and "played" are independent: a game the user owns stays in the available
-- list after it is finished, and a finished game whose access is gone stays in the
-- played list. One mutually exclusive status column cannot express that.

alter table public.gametracker_games
  add column if not exists is_played boolean not null default false;

update public.gametracker_games
  set is_played = true
  where status = 'played';

alter table public.gametracker_games
  drop constraint if exists gametracker_games_rating_status_check;

alter table public.gametracker_games
  drop constraint if exists gametracker_games_access_status_check;

alter table public.gametracker_games
  drop constraint if exists gametracker_games_status_check;

drop index if exists public.gametracker_games_status_name_idx;

alter table public.gametracker_games
  drop column if exists status;

alter table public.gametracker_games
  add constraint gametracker_games_rating_played_check check (
    rating is null or is_played
  );

create index if not exists gametracker_games_name_idx
  on public.gametracker_games(name);
