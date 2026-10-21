# Plan: Session expired handler (Step 4 of flaky-e2e-tests)

## Overview

Add one reusable behaviour that forms can call when an auth request fails. If the error means the user's session no longer exists, the handler signs the user out locally, sends them to the login page with the current page as the redirect target, and shows a clear "session expired" toast. If the error is anything else, the handler does nothing and tells the caller so, so the caller can show its own error. This plan covers only the handler and its tests. Wiring it into the forms is Steps 5 and 6 of `planning/flaky-e2e-tests/plan.md`.

## Scope

**Included**

- A composable that recognises session-gone errors and reacts to them.
- Nuxt composable tests for every behaviour the handler promises.
- A separate, Nuxt-free check for "is this error session-gone?", verified by integration tests against the local Supabase with real errors.

**Out of scope**

- Using the handler in `Update/Password.vue` or `Update/Info.vue` (Steps 5 and 6).
- An app-wide auth listener.
- Any e2e test (Step 5 of the parent plan covers the end-to-end behaviour).
- Running the composable itself against a real Supabase client; only the error classification is tested for real.
- Changing `useToast`, `useWaitForAuthUser` or the login page.

## Design Decisions

1. **Name and location**: the composable is called `useSessionExpiredHandler`, lives in `app/composables/`, with tests in `test/nuxt/composables/`.
2. **Input**: callers pass the error object returned by Supabase (the `error` in `{ data, error }`). The handler does not catch thrown errors.
3. **Return value**: a clear signal that tells the caller whether the error was handled. When it was handled, the caller shows nothing further.
4. **Detection**: by Supabase's stable error codes and error class, not by message text. This deliberately replaces the message-text wording of decision 7 in the parent plan, because codes do not change when Supabase rewords a message. Session-gone means: error code `session_not_found`, `session_expired`, `refresh_token_not_found` or `refresh_token_already_used`, or Supabase's "auth session missing" error class. Every other error is "not handled".
5. **Reaction when handled**, in this order of intent: sign out with local scope, navigate to the login page with the current full path as the `redirect` query parameter, show one error toast. The redirect and the toast happen even when the local sign-out fails.
6. **Toast text**: "Your session has expired. Please log in again."
7. **Not handled means untouched**: no sign-out, no navigation, no toast.
8. **Reuse**: use the existing `useToast`, the Supabase client and user composables, and the project's navigation approach. No new dependency.
9. **Real-error verification**: the "is this error session-gone?" check is a separate pure function that does not depend on Nuxt, so the Node-based integration project can run it. The composable uses it. Integration tests in `test/integration/` obtain real errors from the local Supabase and assert how the function classifies them. The Nuxt composable tests keep using a mocked client.
10. **Scenarios covered for real**: a revoked session (`session_not_found`), a refresh token that is gone or reused, a client with no session at all, and an unrelated error (weak password).
11. **When Supabase disagrees with this plan**: if a real scenario returns something other than expected (another code, or an error that cannot be reproduced), the step stops, reports what Supabase really returned, and decision 4 is updated before continuing. A test is never bent to match an assumption.

## Prerequisites

- None. Nothing in the app consumes the handler yet, so this is shippable on its own.

## Steps

### Step 1 — Handle a "session not found" error

**Goal**: the handler reacts correctly to the error seen in the CI failure.

**TDD**: write nuxt composable tests first, mocking the Supabase client, navigation and current route. With an auth error whose code is `session_not_found`, assert one behaviour per test:

- the handler reports that it handled the error;
- the local sign-out is requested with local scope;
- navigation goes to the login page with the current full path as `redirect`;
- exactly one error toast is shown, with the text from decision 6, and not the raw Supabase message.

The tests must fail before the composable exists.

**Acceptance criteria**:

- The tests above pass.
- The composable is auto-imported like the other composables.
- Typecheck and lint pass without casts, `any` or `unknown` in app code.

**Notes**: the current path must include the query string, so the user lands exactly where they were. This step is already implemented, with the check for the error code written inside the composable.

### Step 2 — Extract the session-gone check and verify it against a real revoked session

**Goal**: the check "is this error session-gone?" exists on its own without Nuxt, and is proven against the exact error the local Supabase returns for a revoked session.

**TDD**: write an integration test first in `test/integration/`. With a generated user, sign in twice to get two sessions, sign out globally with one, then make a real authenticated request with the other (the update-user request, as in the CI failure). Assert that the real error is classified as session-gone. It must fail before the function exists. Keep the existing Step 1 composable tests green throughout; they are the check that the extraction changes no behaviour.

**Acceptance criteria**:

- The check recognises the `session_not_found` code and the "auth session missing" error class.
- The check is a standalone function that loads in the Node integration project without Nuxt.
- The composable uses it instead of its own inline check.
- The integration test passes against the local Supabase and fails if the function is made to return false.
- The generated user is always removed afterwards, including on failure, following the pattern from the parent plan.
- The Step 1 composable tests still pass unchanged.

**Finding (decision 11)**: the local Supabase answers the revoked-session request with 403 `session_not_found`, but the auth client library turns that into its "auth session missing" error class (status 400, no code) before the app sees it. So the real error for the CI scenario is recognised by class, not by code. This step therefore recognises both the `session_not_found` code and the "auth session missing" error class, and Step 3 no longer needs to add the class.

**Notes**: the extraction and its first use are in the same step. Confirm what the revoked-session error really contains (status, code) before asserting, per decision 11. `getTestUserSession.spec.ts` shows how an integration test talks to the local Supabase.

### Step 3 — Handle the other session-gone errors and verify them for real

**Goal**: every session-gone error from decision 4 triggers the same reaction, and the real Supabase errors for these situations are classified correctly.

**TDD**: first, in the integration project, reproduce for real and record what Supabase returns for:

- a refresh token that is gone or already used (for example refreshing with a stale or already-rotated token, or after the session was removed);
- a client with no session making an authenticated request (expected to be the "auth session missing" class, already recognised in Step 2; assert it for real).

Write one test per scenario asserting the real error is classified as session-gone; they must fail first. If a scenario cannot be reproduced, or returns something different, apply decision 11 and report it. Then add nuxt composable tests, one per case, asserting the composable reports handled, redirects and shows the toast, for `session_expired`, `refresh_token_not_found` and `refresh_token_already_used`. The ones not covered by earlier steps must fail first. The auth session missing class is already covered by Step 2.

**Acceptance criteria**:

- All three composable cases and the real-error integration tests pass.
- Detection uses codes and the error class only, with no message text matching.
- Integration tests clean up the users they create, also on failure.

**Notes**: in the nuxt tests, build errors with the library's own error classes rather than plain objects, so a library change is noticed.

### Step 4 — Leave unrelated errors alone, verified with a real weak password error

**Goal**: errors that are not session-gone keep the caller's existing behaviour.

**TDD**: first an integration test: with a generated user signed in, a real update-user request with a weak password returns an error; assert the check classifies it as not session-gone. It must pass only once the check is strict (confirm it can fail by temporarily treating every error as session-gone). Then nuxt composable tests with an unrelated error and with no error at all. Assert one behaviour per test: the handler reports not handled, no sign-out, no navigation, no toast.

**Acceptance criteria**:

- The tests pass.
- Passing no error returns "not handled" and does nothing.
- An error with an unfamiliar code is also treated as not handled, so a brand-new Supabase code never causes an unwanted logout.

**Notes**: check the local Supabase password rules, since a password must be weak by the server's standard, not the app's.

### Step 5 — Keep the redirect when local sign-out fails

**Goal**: a failing sign-out cannot leave the user stuck on a dead page.

**TDD**: add nuxt composable tests where the local sign-out fails, once by returning an error result and once by throwing. Assert for each: the redirect to login with `redirect` still happens, the toast is still shown once, and the handler still reports handled.

**Acceptance criteria**:

- Both failure styles pass.
- A failed sign-out does not leak an unhandled rejection from the handler.

### Step 6 — Final verification

**Goal**: confirm the work is shippable.

**Acceptance criteria**:

- `yarn typecheck`, `yarn lint` and `yarn test` pass, with the local Supabase running for the integration tests.
- No existing component or page is changed. The only new or changed files are the composable, the standalone check, and their tests.
- The test names follow the project convention (one behaviour per test, named after the behaviour), per `ai-context/testing.md`.
- The final report states which real Supabase errors were observed for each scenario, and any difference from decision 4.
- Guardrail gap check per `ai-context/guardrail-gaps.md`: this work adds a feature and fixes no bug, so no gap is reported. The e2e guardrail for the behaviour arrives in Step 5 of the parent plan.
