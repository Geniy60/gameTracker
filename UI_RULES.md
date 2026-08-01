# UI Rules

These rules define the default interface conventions for a simple personal-use React Native / Expo application.

Use these rules for new screens and UI changes unless the user explicitly asks for a different design.

---

# App shell

Wrap the app in `SafeAreaProvider`.

Top-level app screens must use `SafeAreaView` with:

* `edges={['top', 'right', 'bottom', 'left']}`
* `flex: 1`

The app content must never overlap the status bar, gesture area, Android navigation buttons, or phone system UI.

---

# App header

The root application screen must have a compact header row at the top.

Default header layout:

* `flexDirection: 'row'`
* `alignItems: 'center'`
* `justifyContent: 'space-between'`
* `paddingHorizontal: 20`
* `paddingTop: 5`

Default app title:

* `flex: 1`
* `fontSize: 24`
* `fontWeight: '700'`

The settings button belongs in the same row, on the right.

Default settings button:

* touch target around `44x48`
* centered icon
* `Ionicons` icon `settings-outline`
* icon size `26`

Use settings for rarely used functions, diagnostics, logs, reference data, secondary configuration, and other actions that should not be part of the everyday main flow.

---

# Main menu

The main menu must be a row of tabs.

Default tab container:

* `flexDirection: 'row'`
* small gap between tabs
* compact padding around the tab row
* `marginBottom: 12`

Default tab:

* `flex: 1`
* `minHeight: 44`
* centered label
* `borderRadius: 6` to `8`
* clear active state

Do not use a vertical menu, drawer, card grid, or landing page for the primary app sections unless the user explicitly requests it.

Do not hard-code these rules to a specific color palette. Keep colors consistent within the project.

---

# Tab screen layout

Interfaces available from the main tab menu should share the same default structure.

Default order:

1. Toolbar with search first and an add button on the right when adding is part of the workflow.
2. Quick filter row below the toolbar when filtering is useful.
3. Object list below the filters.

Default screen container:

* `flex: 1`

Default toolbar:

* `flexDirection: 'row'`
* `alignItems: 'center'`
* `gap: 10`
* `marginBottom: 12`

Default search input:

* `flex: 1`
* `height: 44`
* `borderRadius: 8`
* one-line text input
* clear button when text is present

Only the object list should scroll. The whole screen should not scroll when the search row and filters are visible.

Default list scroller:

* `flex: 1`
* content gap around `10`
* bottom padding around `24`

---

# Action buttons

Use compact icon buttons for common actions.

Do not use text labels inside compact action buttons when a familiar icon is available.

Every icon action must have a Russian accessibility label from the centralized strings/resources file.

Default add button near search:

* `44x44`
* `borderRadius: 8`
* centered plus icon

Default card action button:

* `36x36` for dense cards or `40x40` for roomier cards
* `borderRadius: 8`
* `borderWidth: 1`
* centered icon

Default icons:

* add: plus icon
* edit: pencil icon
* delete: delete/trash icon or a consistent remove icon
* back: arrow-back icon

Choose one icon style per project and keep it consistent.

---

# Lists and cards

Default object cards:

* `flexDirection: 'row'`
* `alignItems: 'center'`
* `justifyContent: 'space-between'`
* `minHeight: 64`
* `borderRadius: 8`
* `borderWidth: 1`
* `paddingHorizontal: 14`
* `paddingVertical: 10`

The main information block should use `flex: 1` and padding on the right so action buttons do not crowd the text.

Default object name:

* `fontSize: 17`
* `fontWeight: '600'`

Secondary metadata should be smaller than the object name and placed below it.

Default action row:

* `flexDirection: 'row'`
* `alignItems: 'center'`
* gap between `6` and `8`

By default, tapping an object card opens the edit screen for that object.

When search or quick filters return no matching objects, show a dedicated filtered-empty state instead of an empty list.

The filtered-empty state should:

* clearly say that nothing was found
* include a reset action
* reset all active search text and quick filters when pressed

Keep this state visually consistent with the normal empty-list state, but do not reuse text that implies the whole collection is empty.

---

# Screens and navigation

Implement normal workflows as screens.

Use navigation screens for:

* add forms
* edit forms
* previews
* multi-step flows
* related lists

Avoid modal/action-sheet flows for normal object creation or editing unless there is a clear reason.

Native stack screens should open and close immediately.

Default stack options:

* `animation: 'none'`
* `headerShown: false` when custom headers are used

---

# Back behavior

Every secondary screen must have a back button at the top left.

Default back button:

* `37x37`
* `borderRadius: 8`
* `borderWidth: 1`
* centered `Ionicons` icon `arrow-back`
* icon size `22`

Default secondary screen header:

* `flexDirection: 'row'`
* `alignItems: 'center'`
* `gap: 12`
* `marginBottom: 18` for form screens
* `marginBottom: 12` for list/detail screens

Default secondary screen title:

* `flex: 1`
* `fontSize: 20`
* `fontWeight: '700'`

The visual back button and the Android hardware back button must return to the same previous screen or previous local state.

Use `navigation.goBack()` for normal navigation screens.

When a screen replaces its content with a local sub-view, the back button and Android hardware back button must restore the previous local view instead of exiting the whole feature.

---

# Add and edit screens

Add and edit screens for the same object should use the same layout.

Default form screen:

* `SafeAreaView` with all safe-area edges
* `ScrollView` for form content
* `paddingHorizontal: 20`
* `paddingTop: 8`
* bottom padding around `28`

Default form field:

* label above the input
* field gap around `8`
* `marginBottom: 16`

Default input:

* `height: 48`
* `borderRadius: 8`
* `borderWidth: 1`
* `fontSize: 16`
* `paddingHorizontal: 14`

Default primary save button:

* `minHeight: 48`
* `borderRadius: 8`
* centered label
* `fontSize: 16`
* `fontWeight: '700'`

If adding many items in a row is a real workflow, an add screen may include a secondary "save and add another" action.

Do not show create-only secondary actions on edit screens unless the user explicitly requests them.

---

# Related lists

If tapping a card opens a related list instead of editing the object, keep the related list in the same tab area.

The related list view must show:

* a back button at the top left
* the selected object's title
* a toolbar/search row when useful
* filters when useful
* the related object list

The visual back button and Android hardware back button must return to the parent list.

When card tap opens a related list, the parent card must include a separate edit action button.

Parent cards should include a delete action button by default unless deletion is not allowed for that object.

---

# Settings and rare actions

Settings may be a side panel, settings screen, or simple menu, depending on the project.

Keep rarely used actions out of the main tab workflows unless they are needed for everyday use.

Settings entries should be plain, readable rows or buttons. Avoid turning settings into a second main navigation system.

Settings must respect safe areas.

---

# Confirmation dialogs

Use a confirmation dialog before destructive actions such as deleting an object, clearing logs, resetting data, or discarding important changes.

Default confirmation dialog content:

* short title that names the action
* one short message explaining what will happen
* cancel action
* destructive confirm action

Keep dialog text user-facing and Russian through the centralized strings/resources file.

Default destructive dialog behavior:

* cancel button closes the dialog and changes nothing
* destructive button performs exactly the requested action
* do not perform destructive work before the user confirms

Default button order:

* cancel first
* destructive confirm second

Use platform-native alert styling when it is enough.

If the app uses a custom in-app alert component, keep it simple:

* centered modal panel
* dimmed backdrop
* title at the top
* message below the title
* buttons at the bottom
* destructive action visually distinct from cancel
* backdrop tap should not accidentally confirm the action

Do not add extra choices to a destructive confirmation unless the user explicitly requested a more complex flow.

---

# Reusable UI components

Create small shared components for UI patterns that appear more than once.

Recommended shared components:

* back button
* search input
* list scroller
* icon action button
* empty state

Keep these components simple and specific. Do not build a generic design system unless the project actually needs one.
