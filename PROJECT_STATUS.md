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

There is no app header. `UI_RULES.md` asks for one, and this screen deliberately departs from
it: a title naming the app the user just opened, next to a refresh button for data only this
phone ever writes, was costing vertical space on a list of tall cards. Losing the button
leaves no manual refetch, which is acceptable because every mutation already invalidates the
query and nothing else writes to the table. Pull to refresh is the obvious replacement if one
is ever wanted.

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

Every row starts with an 88x132 cover picture on the left, followed by a column holding the
name and one line per property the game actually has: access, rating, and the note. The note
comes last, being the only free text. The cover is deliberately large: the wishlist is meant
to read as a shelf of games rather than a dense table, which is worth the taller rows. Row
content is top aligned and the action buttons stack in a column on the right, because a short
block of text centred beside a tall cover reads as unfinished. Covers are drawn with `expo-image` rather than the React Native
`Image`, because it keeps its own disk cache and scrolling the list must not refetch
anything. A game without a cover shows a placeholder, which keeps row heights even.

Covers come from SteamGridDB. It was chosen over RAWG and IGDB after all three were probed:
RAWG's API was not answering at all and its monthly uptime is around 83%, while IGDB needs a
Twitch client secret exchanged for a token, and a secret has no business being in a mobile
bundle. SteamGridDB needs only a read key in a header. Its coverage of PlayStation
exclusives was verified by hand, including games that never shipped on Steam.

The lookup is two requests: the game id by name, then one cover filtered to
`dimensions=600x900&types=static&nsfw=false&humor=false&limit=1`. The adult and joke flags
matter because the artwork is community uploaded. There is no `official` style; the styles
are `alternate`, `material`, `no_logo` and `white_logo`, so the first result is simply taken.
The stored address is the thumbnail rather than the full picture. The two were measured: the
thumbnail is 267x400 and 67 KB, the full one 600x900 and 762 KB. At the 88x132 the list draws
a three times density screen asks for roughly 264x396 pixels, so the thumbnail is already the
right size and the full picture would be eleven times the traffic for nothing.

The lookup runs after a save, not before it, and is never awaited by the caller. Two requests
to a foreign server would otherwise hold the form open every time a game is saved. It only
runs for a game whose `cover_url` is still empty. Every failure is silent: a game without a
cover is a normal game.

A cover belongs to the name it was found by, so renaming a game in the form clears it and the
following save looks up a new one. That is the whole cure for a wrong cover: correct the
title, save, get the right picture. It does not help when the title is already right and the
service simply returned the wrong artwork first, which would need a picker showing the
candidates. That was deliberately not built until it turns out to be needed.

`EXPO_PUBLIC_STEAMGRIDDB_API_KEY` lives in `.env.local`. Being an `EXPO_PUBLIC_` variable it
is embedded in the app bundle. That is an accepted trade-off for skipping a local script: the
key is read only, so the worst case is a stranger spending the quota.

`.env.local` is ignored by git, so it is not part of what EAS uploads. Every `EXPO_PUBLIC_`
value is inlined at bundle time, which was confirmed by finding all three of them in an
exported bundle. A cloud build therefore needs the same three variables defined in the EAS
`production` environment, which is the one the `apk` profile names. Without them the app
throws from `supabaseClient.ts` the moment it starts. `SUPABASE_DATABASE_URL` must not be
uploaded: it carries the database password and only local migration scripts use it.

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

An unplayed game carries two buttons above the delete one, and neither ever moves or changes
meaning. The access button opens a dialog offering bought, subscription, at a friend's, and
no access at all; it stays after a purchase, because it is also how the kind of ownership is
corrected later. The played button marks the game finished and asks first, since it is the
one row action that takes the game out of the list being looked at. A played game has
neither, only delete.

This replaced a single button that derived "the one next move" and changed meaning after each
tap, so two taps in the same spot did two different things and the second one made the game
disappear. `src/gameActions.ts` existed only to make that guess and was deleted with it.

Row buttons wear the same accent frame as the add button and the active tab, at the 40x40
UI_RULES gives for roomier cards. The dim outline they had before made them read as smaller
and less real than the delete button beside them.

Sorting depends on the tab. The wishlist follows the user's own order through the `priority`
column, lowest first, with `createdAt` breaking ties. The played tab is a reference list
sorted by name. `createdAt` is owned by the database and never written by the app; an upsert
on edit was verified to preserve it.

The wishlist order is edited by dragging a row after a long press, using
`react-native-reorderable-list` on top of `react-native-reanimated`. A new game is written to
the end of the queue, so a fresh idea does not push aside what the user already decided to
play next.

The list runs a custom pan gesture limited to the vertical axis. The library's default one
has no axis limit and swallowed the sideways swipe that changes tabs, since the list is
nested inside the horizontal pager. Dragging is also disabled outright on the played tab.
The long press delay is shortened from the React Native default of 500 ms, which felt
sluggish for the main way of reordering the list.

The library's default scale animation on a dragged row is switched off. It pushed the row
past the list bounds, where Android clips, so the side borders and rounded corners were cut
off while dragging. Bringing it back would mean moving the screen's horizontal padding into
the list content container, which would also stretch the top line across the full width.

Dragging is offered only on the whole wishlist. With a filter or a search active it is turned
off, because a row would then be dropped past neighbours the user cannot see and the resulting
order would not be the one the drag described. Played games still carry priority values, so
`reorderPriorities` in `src/gameOrder.ts` reuses the values the wishlist games already occupy
rather than renumbering from one, which leaves the played ones interleaved where they were. It
is unit tested. The new order is written into the query cache before the request, otherwise
the list snaps back to the old order the moment the finger is lifted.

Priorities are saved with plain per-row updates rather than one upsert: an upsert payload
carrying only `id` and `priority` would be rejected as an insert against the not-null columns.

Typing a name offers title suggestions from SteamGridDB under the field, and taking one closes
the list. This is not only about saving typing: the cover lookup searches by name, so an exact
title is what makes it find the right game. The search is debounced and runs through TanStack
Query, so going back to a term already typed costs nothing.

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

The project is linked to EAS as `@geniy60/gametracker`, so `npm run build:apk` runs the `apk`
profile straight away. `app.json` carries the icon, the adaptive icon set and the splash, and
holds the Android `versionCode`, which `eas.json` reads locally through `appVersionSource`.

## Last Completed Step

Added the PlayStation Network import script and filled the played tab with it.

Details:

- `scripts/importPsnGames.mjs` reads the trophy list through `psn-api`, a dev
  dependency, and inserts the games that are missing. `PSN_NPSSO` is read from
  `.env.local` and documented in `.env.example`. It never reaches the phone or git.
- The script is idempotent: it compares against the names already in the table and
  inserts only what is new, so it is safe to run again. `--dry-run` prints the list
  without writing and `--limit N` takes only the first N, which is how the first run
  was meant to be made.
- Name matching ignores case, trademark marks and repeated spaces, nothing more.
  Merging PS4 and PS5 entries needs that much; anything cleverer would also merge a
  remaster with the original, and a duplicate row is easier to fix by hand than a
  game that never arrived.
- Imported games get `access = 'purchased'`, since that is what the played tab's own
  add button uses. A trophy list does not say how the game was obtained, so this is a
  default to correct, not a fact.
- Hidden titles are skipped. Titles with no trophies earned are kept: a game appears
  in the list once it has been launched, which is exactly what the played tab means.
- Imported rows have no cover. Covers are only looked up after a save from the form,
  so filling them needs a second script, which is the next step.
- The dotenv reader moved from `applyMigration.mjs` into `scripts/loadEnv.mjs`, since
  both scripts need it now.
- The account holds 93 titles with a trophy list. The dry run merged none of them: this
  account has no PS4 and PS5 pair sharing one name.
- The dry run found three entries named after the trophy set rather than the game, such
  as `Mortal Kombat 11 Trophies`. A trailing `Trophies` is now stripped, otherwise the
  cover lookup would search for a game that does not exist under that name.
- Ten games were imported first and a second dry run then reported 11 rows in the table
  and 82 titles still new, which is the idempotency working. The remaining 82 followed.
- The table now holds 93 games, all of them played, none of them duplicated, and 92 with
  no cover. The wishlist is empty, which it already was.
- PSN capitalisation is kept as it comes, including shouting ones like `SILENT HILL 2`.
  Title casing them would break `LIMBO`, `INSIDE` and `F.I.S.T.`, which are stylised that
  way on purpose.

Previous step:

Linked the project to EAS and submitted the first cloud APK build.

Details:

- `npx eas-cli init` created project `c6e3ce44-271d-4c5e-a408-a889eef716b2` under the
  `geniy60` account, and the Android `versionCode` was bumped to 2.
- `expo-font` was installed as a direct dependency. Expo Go carries it implicitly, so a
  standalone build needed it declared.
- Build `3b21a94b-4789-4931-8842-8a61ae55fd04` was started with `--no-wait` from commit
  `f98f871`. It was still in progress at the time of writing, so the APK has never been
  installed on the phone yet.

Previous step:

Drew the app icon and the splash artwork.

Details:

- A gamepad in the app palette, generated from an SVG rather than hand drawn, so it can
  be regenerated at any size. The generator lives outside the repository; the rendered
  PNGs in `assets/` are the artifact.
- The full Android adaptive set as in Fridge: foreground, background and monochrome, plus
  a square `icon.png` and `splash-icon.png`.
- All artwork sits inside the central 66% circle Android guarantees to show, the furthest
  point being 288 of the 338 allowed, so no launcher mask clips it. Checked against
  circular and rounded masks and down to 48 pixels.
- The splash uses the legacy `expo.splash` key rather than the `expo-splash-screen`
  plugin, matching GymBro on the same SDK and avoiding a new dependency.

Previous step:

Added title suggestions to the game form.

Details:

- `src/services/coversService.ts` became `src/services/steamGridDb.ts`, since it now
  answers two questions rather than one, and both go to the same service.
- Suggestions run through TanStack Query with the typed term in the key, debounced by
  350 ms and only from two characters up.
- The suggestion list closes when one is taken and reopens on the next keystroke, so it
  does not sit under the field while the rest of the form is filled in.

Previous step:

Turned dragging off while the wishlist is filtered or searched.

Details:

- A drag on a narrowed list moved a row past neighbours that were not on screen, so
  the order it produced was not the one it appeared to describe.
- Rows only subscribe to the drag gesture when the whole wishlist is showing.

Previous step:

Removed the app header.

Details:

- Deleted `src/components/AppHeader.tsx` along with the refresh state, its minimum
  feedback delay, the app title string and the refresh accessibility label.
- The tab row is now the first thing under the safe area.

Previous step:

Replaced the shape-shifting quick-step button with two fixed ones.

Details:

- The access button opens a choice of ownership kind instead of silently setting
  "purchased", and it stays on the row afterwards so the choice can be changed.
- A game with no access now shows a "Купить" line, so the card states what it is rather
  than leaving the reader to infer it from a missing line.
- Deleted `src/gameActions.ts` and its tests. With both buttons always present there was
  nothing left to derive.
- Row buttons grew to 40x40 and took the accent border used elsewhere in the app.

Previous step:

Filled the covers from SteamGridDB.

Details:

- Added `src/services/coversService.ts`. Every path through it returns null instead of
  throwing, so a lookup can never break a save.
- The cover is fetched after the save completes and written with a targeted update, so the
  form closes immediately and the picture appears a moment later.
- Verified the whole API by hand against the real key before writing any code: search,
  cover filters, the flags, and coverage of PlayStation exclusives.
- Rows now use a 44x66 portrait cover, matching the 2:3 box art the service returns.

Previous step:

Prepared the list for cover pictures.

Details:

- Applied `supabase/migrations/20260802140000_gametracker_cover_url.sql`: a nullable
  `cover_url` column.
- Rows now put a cover on the left and stack the name and each property on its own line.
- Added `expo-image` for its disk cache; the built-in `Image` refetches while scrolling.
- Dropped the "Играл" mark from rows. It could never appear once the wishlist stopped
  holding played games.

Previous step:

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

A second script to fill the covers of the 92 rows where `cover_url` is null. It is separate
from the import because it is around twice as many requests to SteamGridDB, and a failure in
the middle of those must not leave the import half done. It goes one request at a time with a
pause, and stops on 429 or 403 rather than retrying. Being restricted to empty covers makes
it resumable, so stopping costs nothing.

Open afterwards:

- Whether the long press needs a visible drag handle, since nothing on a row hints that it
  can be dragged.
- Whether picking a cover by hand is needed. Renaming a game is the only cure for wrong
  artwork today, which does nothing when the title is already correct.

## Important Decisions And Open Questions

- No status field. Tabs are derived from `isPlayed` alone; `access` only drives the wishlist
  filter. A "playing now" flag was discussed and deliberately deferred.
- Drag-and-drop was chosen over move-up arrows after the trade-off was laid out, in exchange
  for the Reanimated dependency chain.
- Dark theme only. A light theme was deliberately deferred.
- No per-user scoping. The app is single user, unlike GymBro which has a user selector.
- Open question: the GitHub repository visibility is unknown. Real Supabase keys are kept
  out of git as a precaution.
- Suggested but not implemented: autocomplete of game titles and cover art from an external
  game database such as RAWG or IGDB. This would add an API key and network dependency.
- The PSN import stays a local script and is run by hand. Sony's API is undocumented and
  carries no obligation to us, so the account is worth treating carefully: no schedule, no
  loop, and no retry after a refusal. Known limit: only games with a trophy list come back,
  so a game without one still has to be added by hand.
