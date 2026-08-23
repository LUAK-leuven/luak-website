# Plan: Fix Auth State Update Delay After Login

## Overview

After a user submits their credentials on the login page, the app calls `supabase.auth.signInWithPassword()` and immediately navigates once that promise resolves. However, `@nuxtjs/supabase`'s reactive `useSupabaseUser()` ref is populated slightly later, through a separate asynchronous `getClaims()` call triggered by the module's `onAuthStateChange` listener. Because route middleware reads `useSupabaseUser()` synchronously, navigating too early causes the middleware to see a stale/null user and bounce back to `/login`, forcing the user to click "Log in" a second time. This plan introduces a shared composable that waits for the auth user ref to settle before navigating after any auth action (login, signup, password reset).

## Scope

- Add a reusable composable that waits for `useSupabaseUser()` to reflect the post-auth-action state (with a timeout fallback) before the caller navigates.
- Apply this composable to `login.vue`, `signup.vue`, and `reset-password.vue` (the three pages that call a Supabase auth-mutating method and then navigate).
- Out of scope: `confirmLogin.vue` (already implements the correct pattern independently and doesn't call a Supabase auth method directly — will not be migrated to avoid unrelated risk), `forgot-password.vue` and `Update/Password.vue` (no post-action navigation, unaffected), the `@nuxtjs/supabase` module itself (third-party, not modified), any OAuth/social login flow (none exists in the codebase), and the profile overview page's "Not logged in yet" flicker (not addressed by this plan).

## Design Decisions

1. **Shared composable vs. per-page fix**: Implement a reusable composable (e.g. `useWaitForAuthUser()`) rather than duplicating the wait logic in each page, so the pattern stays consistent and testable in one place.
2. **Timeout fallback**: The wait-for-user composable must not hang indefinitely if the user ref never resolves (e.g. network hiccup). It resolves after a bounded timeout (a few seconds) and navigation proceeds regardless, preserving today's behavior as the worst case rather than a permanent hang.

## Prerequisites

None — no schema, migration, or config changes required.

## Steps

### Step 1 — Add `useWaitForAuthUser` composable with tests
**Goal**: Provide a single composable that resolves once `useSupabaseUser()` has a truthy value (or a timeout elapses), for use after any auth-mutating action.
**TDD**: Write a unit test (Vitest) for the composable that:
  - Asserts it resolves immediately if `useSupabaseUser()` already has a value.
  - Asserts it resolves once the user ref transitions from `null`/`undefined` to a value (simulate via setting the ref after a tick).
  - Asserts it resolves (without throwing) after the timeout elapses if the user ref never becomes truthy.
**Acceptance criteria**:
  - `useWaitForAuthUser()` (or equivalent name) exists in `app/composables/`.
  - Calling it returns a promise that resolves under all three scenarios above.
  - Timeout duration is a named constant, not a magic number, so it's easy to tune later.
**Notes**: Model the "wait for ref to change" logic on the existing pattern in `app/pages/confirmLogin.vue` (`watch(user, ..., { immediate: true })`), but wrap it in a promise with a `setTimeout` race so it can't hang forever.

### Step 2 — Use the composable in `login.vue` before navigating
**Goal**: Ensure the login page waits for the auth user state to settle before triggering navigation, so middleware sees the correct state on the very first attempt.
**Acceptance criteria**:
  - After a successful `signInWithPassword`, the page awaits `useWaitForAuthUser()` before calling `navigateTo(...)`.
  - Existing behavior (redirect query param support, error handling on `setFieldError`) is unchanged.
  - Manually verified (or via existing e2e/component tests if present): logging in from `/login` with a `redirect` query param lands on the target page on the first submit, without bouncing back to `/login`.
  - Manually verified: logging in without a `redirect` query param lands on `/profile/overview` on the first submit.

### Step 3 — Use the composable in `signup.vue` before navigating
**Goal**: Apply the same fix to the signup flow, which has the identical race when `data.session` is present (email confirmation disabled) and it navigates straight to `profile-overview`.
**Acceptance criteria**:
  - After a successful `signUp` call that returns a session, the page awaits `useWaitForAuthUser()` before calling `navigateTo({ name: 'profile-overview' })`.
  - The email-confirmation-enabled branch (`navigateTo({ name: 'index' })`, no session yet) is left unchanged since there is no user session to wait for in that case.
  - Manually verified: signing up with email confirmation disabled lands on `/profile/overview` on the first attempt, without a flicker or bounce.

### Step 4 — Use the composable in `reset-password.vue` before navigating
**Goal**: Apply the same fix after a successful password update, which also navigates to `/profile/overview` immediately after the Supabase call resolves.
**Acceptance criteria**:
  - After `supabase.auth.updateUser(...)` succeeds, the page awaits `useWaitForAuthUser()` before calling `navigateTo({ path: '/profile/overview' })`.
  - Existing success/error toast behavior is unchanged.
  - Manually verified: completing a password reset lands on `/profile/overview` on the first attempt, without a flicker or bounce.
