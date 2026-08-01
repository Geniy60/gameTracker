# AGENTS.md

# Personal Mobile App

## Purpose

Build a useful personal-use application.

The primary goal is to create a working product, not a technically perfect one.

Always prefer simplicity over complexity.

---

# How to work

Before writing code:

1. Explain the plan.
2. Explain why this approach was chosen.
3. Mention reasonable alternatives if they exist.
4. Wait for approval before major architectural decisions.

Do not make large refactorings without explicit approval.

Do not introduce complexity unless there is a real need.

---

# Development philosophy

Follow:

* KISS
* YAGNI
* Readability over cleverness
* Explicit code over magic
* Simplicity over abstraction

Avoid overengineering.

Avoid building infrastructure for hypothetical future requirements.

Simplicity means the simplest correct solution, not avoiding dependencies at all costs.

For standard platform problems, prefer accepted best-practice APIs or libraries over magic-number workarounds.

---

# Scope control

Implement only what was requested.

Do NOT automatically add:

* extra features
* helper frameworks
* generic abstractions
* reusable engines
* future-proof architecture

If something might be useful later, suggest it instead of implementing it.

---

# Communication style

Do not silently make assumptions.

When the user proposes ideas:

* evaluate the idea before implementing it
* point out risks, unnecessary complexity, or MVP scope issues
* suggest a simpler or better alternative when appropriate
* explain the recommendation clearly

When multiple solutions exist:

* explain pros
* explain cons
* explain trade-offs
* recommend one with reasoning

If something is uncertain, explicitly say so.

Do not present guesses as facts.

---

# User interface language

All user-facing app interface text must be in Russian unless the user explicitly requests otherwise.

Use Russian labels for units of measurement.

Keep reusable user-facing text centralized in the project's string/resource file.

Do not scatter Russian/Cyrillic literals through components, services, helpers, or tests unless the project has an explicit approved location for them.

Tests should use English mock data, or reference centralized strings when they need to assert Russian UI text.

When reading files or command output that may contain Russian text in PowerShell, use UTF-8 explicitly when needed, for example `Get-Content -Encoding utf8`, and set PowerShell output encoding for commands where mojibake would make the output hard to understand.

Do not treat broken terminal rendering as evidence that the source file encoding is broken.

---

# User interface rules

Before creating or changing app UI, read and follow `UI_RULES.md` if it exists.

Use the project's established UI patterns first.

Do not introduce a different layout, navigation pattern, or control style unless the user explicitly asks for it or the existing pattern cannot solve the current task.

---

# Coding style

Prefer:

* simple code
* readable code
* explicit code
* small components
* small functions

Avoid:

* unnecessary abstractions
* deep inheritance
* magic behavior
* overly generic helpers

Every abstraction should solve a real problem.

---

# TypeScript

Always use:

* strict mode
* proper typing

Never use:

* any
* @ts-ignore
* @ts-nocheck

Do not bypass the type system just to make code compile.

---

# React

Prefer:

* functional components
* hooks
* simple state management

Avoid:

* premature memoization
* premature optimization
* unnecessary complexity

Optimize only when there is measurable evidence.

---

# Server state and UI refresh

Use TanStack Query by default for data loaded from server/backend sources.

For Supabase, REST APIs, RPC calls, and other remote data, prefer:

* a shared `QueryClientProvider`
* shared query keys
* `useQuery` for server reads
* query invalidation or targeted cache updates after mutations
* query cache invalidation for manual refresh actions

Avoid:

* app-level dirty flags for server data
* duplicated ad hoc loading/refresh state when query state is enough
* refetch chains spread through unrelated components
* storing server data in local component state unless there is a clear UI-only reason

Keep local UI state local. Search text, selected tabs, quick filters, expanded local views, form draft values, and similar screen-only state can stay in `useState`.

When adding tests for query-driven components, wrap them in a test `QueryClientProvider` with a fresh `QueryClient`.

If TanStack Query is not installed in a new project yet, explain why it is the preferred dependency, mention the simpler manual-state alternative, and add it unless the user chooses otherwise.

---

# Dependencies

Before adding a dependency:

* explain why it is needed
* explain alternatives
* explain trade-offs

Prefer fewer dependencies.

Prefer platform capabilities when possible.

Do not avoid a well-established dependency when it is the standard, correct solution for a real platform problem.

---

# Refactoring

Never perform major refactoring automatically.

First explain:

* what will change
* why
* benefits
* risks

Wait for approval.

---

# Project stack

Use the stack that already exists in the project.

For a simple personal-use MVP, it is acceptable for a mobile application to communicate directly with a managed backend service when that is already the chosen architecture.

Do not add a separate backend, Docker, microservices, CQRS, Clean Architecture, background jobs, analytics, payments, or an admin panel unless explicitly requested.

If the project uses database migrations, treat migrations as the source of schema changes.

When a task adds or changes a migration, apply it to the project database immediately unless the user has asked for a dry-run or planning-only step.

---

# MVP

Keep the MVP focused on the smallest useful workflow for personal use.

For each feature area, prefer:

* list
* add
* edit where needed
* delete where needed
* the smallest useful workflow around it

Nothing else unless explicitly requested.

---

# Working process

Keep changes small.

Prefer incremental progress.

Do not generate large amounts of code at once.

Changes should be easy to review and easy to understand.

If a task is large, split it into smaller logical steps.

Before starting implementation work, read `PROJECT_STATUS.md` if it exists.

After each meaningful project step, update `PROJECT_STATUS.md` with:

* current state
* last completed step
* next proposed step
* important decisions or open questions

Write `PROJECT_STATUS.md` in English only. Do not add Russian text or Cyrillic characters to `PROJECT_STATUS.md`.

When the user provides or confirms an image asset, use that exact image file as the project asset after any needed background removal, cropping, or format adjustment.

Do not recreate or redraw a similar replacement unless the user explicitly asks for a redraw.

---

# Verification

After code changes:

* Run `npx tsc --noEmit`.
* Run `npm test`.

Do not start the development server automatically after every small UI change.

Start the development server only when manual verification is needed or startup behavior changed.

For Expo applications, prefer manual verification with the project's existing Expo Go start script when available.

When the user asks to build a new APK, automatically increment the Android `versionCode` before starting the build.

When the user asks to build a new APK, start the EAS APK build command, confirm only that the build was submitted or queued, and then stop. Do not keep the command/chat waiting for the final cloud build result unless explicitly asked.

If the user moves on to the next task after a UI change, treat manual phone verification as completed.

Do not add separate `PROJECT_STATUS.md` entries just to record routine manual phone verification.

Do not add new automated tests unless they are explicitly useful for the current step.

---

# Decision rule

When in doubt:

Choose the simplest solution that correctly solves the current problem.

Do not optimize for hypothetical future requirements.
