create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.gametracker_games (
  id text primary key,
  name text not null,
  status text not null,
  platform text not null default 'other',
  rating integer,
  note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint gametracker_games_status_check check (
    status in ('wishlist', 'played')
  ),
  constraint gametracker_games_platform_check check (
    platform in ('pc', 'playstation', 'xbox', 'switch', 'mobile', 'other')
  ),
  constraint gametracker_games_rating_range_check check (
    rating is null or (rating between 1 and 10)
  ),
  constraint gametracker_games_rating_status_check check (
    rating is null or status = 'played'
  )
);

create index if not exists gametracker_games_status_name_idx
  on public.gametracker_games(status, name);

drop trigger if exists gametracker_games_set_updated_at on public.gametracker_games;
create trigger gametracker_games_set_updated_at
before update on public.gametracker_games
for each row execute function public.set_updated_at();
