# Project Status

## Current State

The project is a minimal Expo SDK 54 / React Native / TypeScript Android app for tracking
personal video game lists.

The app uses a single dark palette. There is no theme switcher and no settings screen yet.
Confirmation and error dialogs are rendered in-app rather than by the OS, so they follow the
dark palette too.

A game has two independent properties rather than one status:

- `access`: `purchased`, `friend`, `subscription`, or `null` for no access at all
- `isPlayed`: whether the user has played it

The wishlist is the point of the app: everything the user still wants to play. Ownership
does not decide whether a game belongs there, so there are only two tabs:

- Wishlist: every game that is not played yet, owned or not
- Played: every played game, with or without access

Inside the wishlist an ownership filter narrows the list to `Все` / `Есть` / `Купить`, where
`Есть` means access is set (bought, at a friend's, or in a subscription) and `Купить` means
there is none. The filter is screen-local state, not part of the query. Both filters live in
`src/gameFilters.ts`, which is unit tested.

There used to be a third `Есть` tab. It was removed because ownership is a property of a
wanted game, not a separate list, and a played game that is still owned had to appear in two
tabs at once.

The two tabs live in a horizontal paging `ScrollView`, so they can be swiped between as well
as tapped, following the sibling Fridge app. Tapping a tab scrolls the pager without
animation; swiping updates the active tab from the scroll offset. The pager is never
scrolled programmatically during a drag, which would fight the gesture.

Unlike Fridge, both pages are mounted at once. Fridge mounts pages lazily because each of its
sections loads its own data; here every tab is a filter over one already loaded query, so
lazy mounting would add code without saving work. One consequence is that each tab keeps its
own search text and filter.

All tabs share the same screen component and show a search row, an add button, and a list of
games. Tapping a row opens the edit screen; the trash button deletes after a confirmation
dialog.

The list styling follows GymBro's tile lists and is two separate things that must not be
merged. The scroller carries only a fixed top line, which rows slide under while scrolling.
Every row carries its own background, border and rounded corners, so a list holding one game
looks like one element rather than a mostly empty container. Rows are simply denser than
GymBro's tiles, not frameless. Row spacing is a `marginBottom` on the row, not a `gap` on the
list content, because the drag animation measures whole cells and a container gap sits
outside them.

Rows use `subtleBackground`; `panel` and `surface` both sit too close to the app background
to read as separate elements. Row action buttons use the darker `panel` so they stay visible
against the row.

Each row can also carry one quick-step button, the single obvious next move for that game:
a game with no access offers "bought it", an owned unplayed game offers "played it", and a
game that is already played offers nothing. The logic lives in `src/gameActions.ts` and is
unit tested. "Bought it" now keeps the game in the wishlist and only moves it between the
ownership filters; "played it" is what moves it to the other tab.

Sorting depends on the tab. The wishlist follows the user's own order through the `priority`
column, lowest first, with `createdAt` breaking ties. The played tab is a reference list
sorted by name. `createdAt` is owned by the database and never written by the app; an upsert
on edit was verified to preserve it.

The wishlist order is edited by dragging a row after a long press, using
`react-native-reorderable-list` on top of `react-native-reanimated`. A new game is written to
the end of the queue, so a fresh idea does not push aside what the user already decided to
play next.

Dragging happens inside the list the user sees, which the ownership filter and the search box
can narrow. `reorderPriorities` in `src/gameOrder.ts` therefore reuses the priority values the
visible games already occupy instead of renumbering everything, which leaves every hidden game
exactly where it was. It is unit tested. The new order is written into the query cache before
the request, otherwise the list snaps back to the old order the moment the finger is lifted.

Priorities are saved with plain per-row updates rather than one upsert: an upsert payload
carrying only `id` and `priority` would be rejected as an insert against the not-null columns.

The add/edit screen is one form with name, access, played, platform, rating, and note
fields. Access and played are always editable, since they are what move a game between
tabs. Rating appears only for played games and is cleared on save otherwise; the database
enforces the same rule with a check constraint.

A new game inherits its defaults from the tab the add button was pressed on: the wishlist
starts with no access and unplayed, the played tab starts as purchased and played.

Saving can move a game out of the tab it was edited in. When that happens the app switches
to the tab where the game now belongs instead of returning to a list that no longer contains
it.

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

Made the wishlist the centre of the app: two tabs, an ownership filter, and a manual order.

Details:

- Dropped the `Есть` tab. The wishlist now holds every unplayed game, and `Все` / `Есть` /
  `Купить` chips filter it by ownership.
- Applied `supabase/migrations/20260802120000_gametracker_priority.sql`: added the `priority`
  column and backfilled it from `created_at` descending, so the previous "newest on top"
  order became the starting queue.
- Added drag-and-drop reordering. This pulled in `react-native-reanimated`,
  `react-native-worklets`, `react-native-reorderable-list`, a `babel.config.js`, and a
  `GestureHandlerRootView` in `App.tsx`. `react-native-draggable-flatlist` was rejected: it
  has not had real work since 2023 and targets Reanimated 2, while Expo SDK 54 ships
  Reanimated 4.
- `babel-preset-expo` had to be added explicitly as a dev dependency; without it Metro could
  not resolve the preset the new `babel.config.js` names.
- Verified with `npx expo export --platform android` that the app still bundles.
- 20 unit tests pass.

Previous step:

Added quick-step buttons, per-tab sorting, and a denser list.

Details:

- Rows keep their individual frames and are denser; the scroller adds a fixed top line.
- `createQuickStep` derives the next move from the game itself rather than from the tab, so
  the button is correct wherever the game is shown.
- Added `createdAt` to the model for wishlist sorting. Verified against the database that
  the upsert used on save leaves `created_at` untouched.

Previous step:

Made the three tabs swipeable.

Details:

- Ported the paging `ScrollView` approach from the sibling Fridge app.
- `openTab` is used everywhere the tab changes programmatically, including the jump that
  follows a game to its new tab after a save, so the pager and the tab row cannot disagree.
- Skipped Fridge's lazy page mounting: it exists there because each section fetches its own
  data, which is not the case here.

Previous step:

Replaced the native dialogs with an in-app dark one.

Details:

- Added `src/appAlert.ts` and `src/components/AppAlertHost.tsx`, ported from the sibling
  GymBro app and simplified for a single palette.
- `showAppAlert` replaces every `Alert.alert` call. The native dialog stays only as a
  fallback for the window before the host mounts, where dropping a message would be worse
  than showing a light one.
- The host is mounted once in `AppNavigator`, outside `NavigationContainer`, so dialogs sit
  above every screen.
- The hardware back button dismisses the dialog through its cancel button, so it can never
  trigger a destructive action.

Previous step:

Pointed the `platform` column default at `playstation`.

Details:

- The default was still `other`, left over from the original six platform list. A row
  inserted without an explicit platform would have been typed as `playstation` by the app
  while actually holding `other`.
- Applied `supabase/migrations/20260801210000_gametracker_platform_default.sql` and verified
  that an insert without a platform now yields `playstation`. The test row was removed.
- The check constraint still allows all six values, so adding a platform back needs no
  migration.

Previous step:

Replaced the single status column with independent access and played fields.

Details:

- The previous three value status was wrong: it forced a game to sit in exactly one tab,
  but an owned game that has been played belongs in both available and played.
- Applied `supabase/migrations/20260801190000_gametracker_access_and_played.sql`: added
  `is_played`, carried the old status values over, dropped `status` and its constraints, and
  re-pointed the rating constraint at `is_played`.
- Added `src/gameFilters.ts` with `filterGamesByTab` and `findTabForGame`, plus the first
  unit tests in the project. Six tests pass.
- Verified through the REST API that an owned played game and a played game without access
  both insert, and that a rating without `is_played` is rejected. Test rows were removed.

Previous step:

Added the third tab and the access field.

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

Manual verification on the phone through Expo Go, with the drag gesture as the main risk: the
reorderable list is nested inside the horizontal tab pager, and the two gestures could fight.
Also worth checking whether a long press is discoverable enough without a drag handle.

## Important Decisions And Open Questions

- No status field. Tabs are derived from `isPlayed` alone; `access` only drives the wishlist
  filter. A "playing now" flag was discussed and deliberately deferred.
- Drag-and-drop was chosen over move-up arrows after the trade-off was laid out, in exchange
  for the Reanimated dependency chain.
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
