# Plan: Login — Happy Path E2E Test

## Overview

Add the minimum code required to make the "Login — happy path" Playwright test pass: a thin `fixtures.ts` re-export, a single test in `login.spec.ts`, and a `.gitignore` entry for the auth-state cache directory.

## Acceptance criteria

- `yarn test:e2e` passes with the new test green against a local Supabase instance.
- Navigating to `/login`, filling `paid_this_year@test.com` / `123456789`, and clicking **Sign in** lands the user on `/profile/overview`.
- No production Supabase database is touched (enforced by existing `globalSetup.ts`).


## Implementation tasks

1. **Create `tests/e2e/fixtures.ts`**
   - Re-export `{ test, expect }` from `@playwright/test` unchanged.
   - No custom fixtures or helpers yet; subsequent tasks will extend this file.

2. **Add `tests/e2e/.auth/` to `.gitignore`**
   - Append `tests/e2e/.auth/` to `.gitignore`.

3. **Create `tests/e2e/login.spec.ts` — happy path only**
   - Import `{ test, expect }` from `./fixtures`.
   - Apply `test.use({ storageState: { cookies: [], origins: [] } })` to enforce a clean session.
   - `page.goto('/login')`.
   - `page.getByLabel('Email')` → fill `paid_this_year@test.com`.
   - `page.getByLabel('Password')` → fill `123456789`.
   - `page.getByRole('button', { name: /sign in/i })` → click.
   - `await expect(page).toHaveURL('/profile/overview')`.

4. **Verify**
   - Run `yarn test:e2e` and confirm the new test is green.

## Out of scope

Everything else in `story.md`: `loginAs`, `supabaseAdmin`, `authenticatedPage`, wrong-password test, already-logged-in test, signup tests, password-reset tests.
