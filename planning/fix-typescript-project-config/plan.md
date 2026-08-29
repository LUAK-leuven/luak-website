# Plan: Fix TypeScript Project Setup for shared/server/app Type Resolution

## Overview

`nuxt typecheck` reports dozens of "cannot find name" / "cannot find module" errors for code in `shared/types/`, `server/domain/` and `app/model/`, even though those same files type-check cleanly in isolation. The cause is that Nuxt's `tsconfig.node.json` project — designed only for `nuxt.config.ts` and other build-time config files — currently also includes everything under `test/**`. Because those test files import application source, TypeScript pulls `shared/types`, `server/domain` and `app/model` files into the node project's program, where none of the auto-imported global types (`RentalId`, `EntityId`, `UserId`, ...) or path aliases (`#server/*`, `#shared/*`) are declared. The same files pass cleanly under `tsconfig.app.json`, `tsconfig.server.json` and `tsconfig.shared.json`.

This plan gives tests their own dedicated TypeScript project configured with the same aliases and global type declarations as the real app/server/shared projects, fixes the resulting `~` alias inconsistency in test imports, resolves a `shared/` → `server/` architectural boundary violation, adds lint rules so that class of violation is caught automatically in future, wires `yarn typecheck` into CI, and fixes the two genuine (and already `TODO`-flagged) type errors that were being masked by the noise. The end state is a green `yarn typecheck` that covers every `.ts`/`.vue` file in the repo, enforced in CI.

## Scope

**Included:**
- A dedicated TypeScript project for `test/**` with correct aliases and access to the same auto-imported global types as app/server.
- Migrating test import paths to the project's alias convention (`~` = `app/`, `~~` = root, `#shared`, `#server`, `#test`).
- Moving `ItemEvent` out of `server/domain/` so `shared/types/gear.ts` no longer imports across the shared→server boundary.
- ESLint import-boundary rules (via `eslint-plugin-boundaries`) enforcing shared ↛ server/app, app ↛ server, server ↛ app.
- Adding `yarn typecheck` to CI.
- Fixing the 2 real type errors uncovered once the noise is gone, and enabling `typescript.typeCheck: true`.

**Out of scope:**
- Adding `yarn lint` to CI (not requested).
- A regression test pinning the generated `.nuxt/tsconfig.*.json` alias wiring (not requested — CI running `yarn typecheck` is considered sufficient).
- Any change to `shared/types` or `shared/utils` auto-import behavior — this plan keeps the documented Nuxt pattern and does not introduce explicit imports for auto-imported globals.
- Any further architectural refactor of `app/model`, `server/domain`, or `shared/domain` beyond the one `ItemEvent` relocation needed to fix the boundary violation.

## Design Decisions

1. **Auto-imported global types stay as-is.** `shared/types/*` continues to rely on Nuxt's global type auto-import (documented, recommended pattern). No file in `shared/`, `server/domain/`, or `app/model/` is changed to use explicit imports for these globals.
2. **Tests get their own TS project** (`tsconfig.test.json` at the repo root, referenced from the root `tsconfig.json`), rather than patching `nodeTsConfig` to include test-only aliases/globals. `nodeTsConfig` (in `nuxt.config.ts`) reverts to covering only `nuxt.config.ts`, `content.config.ts`, `playwright.config.ts`, `vitest.config.ts` — no test source files.
3. **`~` means `app/` everywhere**, including in tests. Test imports currently using `~/app/model/...`, `~/server/...`, `~/shared/...`, `~/test/...` are migrated to `~/model/...`, `#server/...`, `#shared/...`, and a relative/`#test` path respectively.
4. **`ItemEvent` moves to `server/types/`** (a type-only home, auto-imported server-side per Nuxt docs), removing the `shared/types/gear.ts` → `server/domain/...` import entirely rather than reversing the dependency direction some other way.
5. **Import boundaries enforced with `eslint-plugin-boundaries`** (new dev dependency, explicitly requested), configured with element types for `shared`, `server`, `app`, disallowing `shared → server`, `shared → app`, `app → server`, `server → app`.
6. **CI gets a `yarn typecheck` step only** (no `yarn lint` step), placed before the Supabase/dev-server/Playwright setup so it fails fast.
7. **No tsconfig-wiring regression test** — CI's `yarn typecheck` is the guardrail for the generated project structure.

## Prerequisites

- None — no migrations or external setup required. `eslint-plugin-boundaries` will be added as a new dev dependency in Step 6.

## Steps

### Step 1 — Give tests their own TypeScript project

**Goal**: `test/**` type-checks as its own project with the correct aliases and the same auto-imported global types as app/server, instead of being folded into the node (config-only) project.

**Acceptance criteria**:
- A root-level `tsconfig.test.json` exists, extending/mirroring the compiler options used by the other generated projects (strict settings, `noEmit`, etc.) and defining `paths` for `~/*` → `app/*`, `~~/*` → root, `#shared/*` → `shared/*`, `#server/*` → `server/*`, `#test/*` → `test/*` and `test/testUtils/*` (matching the existing `#test/*` mapping).
- `tsconfig.test.json`'s `include` covers `test/**/*` and references the generated declaration files that expose the auto-imported globals and path aliases (the shared/app/server equivalents of `.nuxt/types/shared-imports.d.ts` and `.nuxt/imports.d.ts`), so `RentalId`, `EntityId`, `UserId`, `TopoId`, etc. resolve without explicit imports, matching how they resolve in `app/`, `server/`, and `shared/`.
- The root `tsconfig.json`'s `references` array includes `tsconfig.test.json` alongside the existing `.nuxt/tsconfig.*.json` entries.
- In `nuxt.config.ts`, `typescript.nodeTsConfig.include` no longer contains `../test/**/*`, and its `paths` no longer defines `~/*` or `#test/*` (those move to `tsconfig.test.json`). `nodeTsConfig.include` still covers `../content.config.ts`, `../playwright.config.ts`, `../vitest.config.ts`.
- Running a TypeScript check scoped to `tsconfig.test.json` alone produces no "cannot find name" / "cannot find module" errors for identifiers that are valid in app/server/shared (e.g. `RentalId`, `#server/...`, `#shared/...`).
- `yarn typecheck` no longer reports errors originating from `shared/types/rental.ts`, `shared/types/topos.ts`, `server/domain/inventory/InventoryItem.ts`, `server/domain/inventory/ItemEvent.ts`, or `app/model/Rental.ts` being pulled into the node project.

**Notes**: This step only adds the new project and adjusts what `nodeTsConfig` includes — it does not yet fix the import paths inside test files, so `tsconfig.test.json` will still show "cannot find module" errors for the old `~/app/model/...`, `~/server/...`, `~/shared/...`, `~/test/...` style imports. Those are fixed in Step 2. Do not consider this step's acceptance criteria as requiring a fully green `tsconfig.test.json` yet.

### Step 2 — Migrate test imports to the correct alias convention

**Goal**: Every import inside `test/**` uses the same alias meaning as the rest of the codebase, so `tsconfig.test.json` fully resolves them.

**Acceptance criteria**:
- All occurrences of `~/app/model/...` in `test/**` become `~/model/...`.
- All occurrences of `~/server/...` in `test/**` become `#server/...`.
- All occurrences of `~/shared/...` in `test/**` become `#shared/...`.
- The one occurrence of `~/test/testUtils/testServices` becomes the equivalent `#test/testServices` (or a relative import, matching the existing convention used by sibling files in `test/testUtils/`).
- `~/components/...` and `~/composables/...` imports in `test/nuxt/**` are left untouched (these are correctly resolved by the app project already).
- Running the full `yarn typecheck` produces zero errors originating from `test/**` files or from `shared/types/`, `server/domain/`, `app/model/` being pulled in via test imports.
- `yarn test:unit` and `yarn test:e2e` still pass (import paths resolve correctly at runtime too, via Vite/tsconfig-paths).

### Step 3 — Move `ItemEvent` out of `server/domain/`

**Goal**: Remove the `shared/types/gear.ts` → `server/domain/inventory/ItemEvent` import, closing the boundary violation flagged by the existing `// TODO: invalid dependency?` comment.

**Acceptance criteria**:
- `ItemEvent` (currently `server/domain/inventory/ItemEvent.ts`) is relocated to `server/types/inventory/ItemEvent.ts` (a directory Nuxt auto-imports server-side, per the `shared/`-directory docs' guidance on single-context types).
- `shared/types/gear.ts` no longer imports from any `server/` path; it imports `ItemEvent` from its new location using the correct server-side alias/auto-import mechanism, or — if that is not possible from within `shared/` — the type is duplicated/re-exported from a location `shared/` is allowed to depend on. (Resolve whichever approach keeps `shared/` free of any `server/` or `#server` import.)
- `server/domain/inventory/InventoryItem.ts`'s import of `ItemEvent` is updated to the new location.
- `test/testUtils/testDao.ts`'s import of `ItemEvent` (currently `~/server/domain/inventory/ItemEvent`, already migrated to `#server/...` in Step 2) is updated to the new location.
- `yarn typecheck` still passes for all four Nuxt-generated projects plus `tsconfig.test.json`.

### Step 4 — Add ESLint import-boundary rules

**Goal**: Enforce, via lint, the architectural boundaries TypeScript cannot express — `shared` must not import from `server` or `app`; `app` must not import from `server`; `server` must not import from `app`.

**Acceptance criteria**:
- `eslint-plugin-boundaries` is added as a dev dependency.
- `eslint.config.mjs` defines element types for `shared`, `server`, `app` (matching the repo's top-level directories) and boundary rules disallowing: `shared → server`, `shared → app`, `app → server`, `server → app`.
- Running `yarn lint` on the current codebase (post Step 3) passes with these rules enabled — no existing file violates them.
- A deliberately introduced import from `shared/` into `server/` (added temporarily to verify, then removed) is flagged by `yarn lint` before this step's acceptance is considered met.

### Step 5 — Fix the two real type errors surfaced by the clean typecheck

**Goal**: With the import-resolution noise gone, fix the two genuine type errors already flagged with inline `TODO` comments so `yarn typecheck` is fully green.

**Acceptance criteria**:
- `app/components/board/rental/form/itemSelection/index.vue`: the `removeItem` emit handler's generic parameter mismatch (`TS2322` on the `emit('removeItem', ...)` typing) is fixed so the component's emits are correctly typed for both the gear and topo item selection cases it's used for. The `<!--TODO: typeerror-->` comment is removed once fixed.
- `app/components/profile/overview/membership/BuyMembership/Modal.vue`: the `onclick` attribute on the `Button` component is changed to `onClick` (or the correct typed event prop for that component), matching Vue's expected event-handler prop naming. The `<!--TODO: fix type error-->` comment is removed once fixed.
- `yarn typecheck` reports zero errors across all projects (`app`, `server`, `shared`, `node`, `test`).
- `yarn test:unit` continues to pass (no behavior change expected from either fix, but confirm no regression, particularly for any test exercising `itemSelection` or `BuyMembership/Modal`).

### Step 6 — Enable `typescript.typeCheck: true` and wire `yarn typecheck` into CI

**Goal**: Make the now-green typecheck a standing guardrail, both locally (dev/build) and in CI.

**Acceptance criteria**:
- In `nuxt.config.ts`, the commented-out `typeCheck: true` line under `typescript` is uncommented (enabled).
- `yarn build` (or `yarn dev` startup) surfaces type errors as build errors, confirmed by temporarily introducing an obvious type error and observing the build fail, then reverting.
- `.github/workflows/ci.yml` runs `yarn typecheck` as its own step, placed before the "Start supabase server" step so it fails fast without needing any running services.
- A CI run (or local simulation via `act`/manual reasoning about the workflow file) confirms the typecheck step runs with exit code 0 on the current `HEAD` after Steps 1–5.
