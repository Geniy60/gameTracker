-- "Played" and "finished" are two points on one scale, not two independent facts: a
-- game cannot be finished without having been played. One column with three values
-- makes that impossible combination unrepresentable, where a second boolean beside
-- is_played would have needed a constraint to forbid it.
--
-- This is not the old status column coming back. That one conflated ownership with
-- progress, which really are independent. These three values are stages of one thing.

alter table public.gametracker_games
  add column if not exists progress text not null default 'none';

alter table public.gametracker_games
  drop constraint if exists gametracker_games_progress_check;

alter table public.gametracker_games
  add constraint gametracker_games_progress_check check (
    progress in ('none', 'played', 'finished')
  );

-- Everything in the table today came from the PSN import and the owner has finished
-- it. The exceptions are corrected by hand, which is cheaper than guessing here.
update public.gametracker_games
  set progress = 'finished'
  where is_played;

-- The rating rule is unchanged, only rephrased: a game still has to have been played
-- to carry one.
alter table public.gametracker_games
  drop constraint if exists gametracker_games_rating_played_check;

alter table public.gametracker_games
  add constraint gametracker_games_rating_progress_check check (
    rating is null or progress <> 'none'
  );

alter table public.gametracker_games
  drop column if exists is_played;
