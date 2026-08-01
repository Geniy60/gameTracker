# Project Status

## Current State

The project is a minimal Expo SDK 54 / React Native / TypeScript Android app for tracking
personal video game lists.

The app uses a single dark palette. There is no theme switcher and no settings screen yet.

The app shell has a compact header with a manual refresh action and three main tabs, which
are one lifecycle rather than independent lists:

- Wishlist (wanted, no access yet)
- Available (the user can play it but has not)
- Played

Tab labels are deliberately short because three tabs share one row.

Both tabs share the same screen component and show a search row, an add button, and a list
of game cards. A card shows the game name plus platform and rating metadata. Tapping a card
opens the edit screen; the trash button on the card deletes the game after a confirmation
dialog.

The add/edit screen is one form with name, status, access, platform, rating, and note fields.

Two fields are conditional, and both are cleared on save when they do not apply:

- Rating is shown only for the `played` status.
- Access (`purchased`, `friend`, `subscription`) is hidden for `wishlist`, because a wanted
  game is by definition one the user cannot reach yet. It stays visible for `played` so the
  user can still see that a finished game came from a subscription.

The database enforces both rules with check constraints, so the app and the schema cannot
drift apart.

PlayStation is currently the only platform. The available platforms are listed in
`src/gamePlatforms.ts`, and both the form picker and the platform label on cards are hidden
while that list has a single entry. Adding a platform means extending the `GamePlatform`
union, `gamePlatforms`, and `strings.platforms`; the picker and the label come back on their
own. The database check constraint already allows `pc`, `xbox`, `switch`, `mobile`, and
`other`, so no migration is needed for that.

Data is stored in the shared Supabase project that the sibling GymBro and Vacation apps use.
The gameTracker tables use the `gametracker_` prefix. There is one table,
`public.gametracker_games`, with database-level checks for status, platform, and rating
range. Reads and writes go through a small service layer and TanStack Query. Saves use a
single-table upsert; no RPC is needed because a game is one row.

User-facing app text is centralized in `src/strings.ts`.

New game IDs are created through a shared UUID helper backed by `expo-crypto`.

Supabase credentials live in `.env.local`, which is ignored by git. `.env.example` documents
the required variables. Unlike GymBro, this project does not commit a `.env` file with real
keys.

The project is not linked to EAS yet, so `npm run build:apk` requires `npx eas-cli init`
first. `app.json` has no icon or splash assets yet, so Expo defaults are used.

## Last Completed Step

Added the third status and the access field.

Details:

- Applied `supabase/migrations/20260801170000_gametracker_game_access.sql`: widened the
  status check to allow `available`, added the nullable `access` column with its own value
  check, and added a check forbidding access on wishlist rows.
- Verified through the REST API that an `available` row with `subscription` access inserts
  and that a `wishlist` row carrying access is rejected. Both test rows were removed.
- The two subscription variants the user first described were merged into one `subscription`
  value after discussion; the distinction was not needed in practice.

Previous step:

Narrowed the platform list to PlayStation only.

Details:

- `GamePlatform` is now a single-member union, and the available platforms live in
  `src/gamePlatforms.ts`.
- The form platform picker and the card platform label are hidden while only one platform
  exists, so a card with no rating now shows no metadata line at all.
- The table was empty, so no data migration was needed. The database check constraint was
  left untouched on purpose.

Previous step:

Created the initial project and the first working MVP.

Details:

- Scaffolded the Expo project by hand, mirroring the GymBro layout and dependency versions.
- Copied `AGENTS.md`, `CLAUDE.md`, `UI_RULES.md`, `SUPABASE_MIGRATIONS.md`, and the
  migration runner script from GymBro.
- Added and applied `supabase/migrations/20260801120000_gametracker_initial_schema.sql`.
- Verified anon REST access to `gametracker_games` returns 200.
- Pushed the repository to GitHub with `main` as the default branch.

## Next Proposed Step

Manual verification on the phone through Expo Go: add a few games, switch tabs, edit and
delete a game, and confirm the data survives an app restart.

## Important Decisions And Open Questions

- Three statuses (`wishlist`, `available`, `played`). A "playing now" status was discussed
  and deliberately deferred.
- Dark theme only. A light theme was deliberately deferred.
- No per-user scoping. The app is single user, unlike GymBro which has a user selector.
- Open question: the GitHub repository visibility is unknown. Real Supabase keys are kept
  out of git as a precaution.
- Open question: app icon and splash assets are not created yet.
- Suggested but not implemented: autocomplete of game titles and cover art from an external
  game database such as RAWG or IGDB. This would add an API key and network dependency.
- Deferred on purpose: importing played games from the PlayStation Network. Sony has no
  official public API, but the undocumented one used by the PlayStation app is reachable
  through the `psn-api` library. The agreed shape was a local Node script under `scripts/`
  reading an NPSSO token from the environment and inserting rows with the `played` status,
  so the token never reaches the phone or the repository. Known limits: only games that have
  a trophy list are returned, and PS4 and PS5 versions of one game are separate entries.
  Revisit after the app itself is finished.
