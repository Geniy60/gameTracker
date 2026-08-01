-- The app only knows the 'playstation' platform, so a row inserted without one
-- must not silently become 'other', which no TypeScript type allows.
alter table public.gametracker_games
  alter column platform set default 'playstation';
