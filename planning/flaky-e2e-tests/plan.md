# Plan: Fix flaky e2e tests and handle revoked sessions

## Overview

The e2e suite is flaky on CI for two reasons described in `research.md`. First, the "Login & logout" test signs a shared test user out of all sessions, which kills the saved session that later tests reuse, so the random-user password test fails whenever it picks that user. Second, the first login in the global setup can fail on a cold dev server. This plan removes the shared-state problem in the tests, makes the app's log out only end the current device's session, and makes the profile forms handle a revoked session explicitly. Today the password form shows the raw Supabase message and leaves the user on a page where nothing works. Finally it warms up the dev server on CI and records the lesson in the testing guidelines.

## Scope

**Included**

- Dedicated, generated test users for tests that log out or change passwords.
- Log out ends only the current device's session.
- A shared "session expired" handling for the password and info forms: sign out locally, redirect to login with a way back, and show a clear toast.
- Warm-up of the dev server before the e2e tests on CI.
- Regression e2e tests and a testing guideline so this class of bug is caught automatically.

**Out of scope**

- An app-wide auth state listener that redirects from every page.
- Reworking how `Update/Info.vue` reports non-session errors (it currently attaches them to the newsletter field).
- Running CI against a production build instead of `nuxt dev`.
- Replacing `sleep(200)` in "Can change user information", changing the retry count, and other timing cleanups.

## Design Decisions

1. **Revoked session in production**: when a form submit fails because the session no longer exists, the user is signed out locally, redirected to the login page (with the current page as the redirect target), and sees a clear "session expired" toast.
2. **Where the handling lives**: one shared composable used by both `Update/Password.vue` and `Update/Info.vue`. No app-wide handler.
3. **Logout scope**: the app's "Log out" button ends only the current device's session (local scope) instead of Supabase's default global scope.
4. **Logout test isolation**: both. The app logs out locally, and the e2e "Login & logout" test uses its own generated user so it can never revoke a shared user's session.
5. **Password test**: stops using `randomUserTest`. It uses a generated user created just for that test, so the pre-existing test users and their `.auth/*.json` files are never touched.
6. **Setup login flakiness**: treated as a probable cold-start problem. The plan warms up the dev server and makes the setup login wait until the page is interactive. No extra tracing is added; if it recurs the cause is re-investigated.
7. **Which errors count as "session gone"**: a failed request to the auth API whose error says the session, refresh token, or user session is missing, expired, or revoked. Other errors (for example a weak password) keep today's toast behaviour.
8. **Redirect after re-login**: the login page already honours a `redirect` query parameter, so the user lands back on the page they were on.

## Prerequisites

- Local Supabase running and `.env.test` / `.env.local` configured, as for any e2e run.
- Be aware that `global.setup.ts` ("clean db") removes all users, including generated ones, at the start of every run. Generated users must also remove themselves at the end of their test so that repeated local runs do not accumulate users.

## Steps

### Step 1 — Give the "Login & logout" test its own user

**Goal**: the test that logs out no longer touches a shared test user's session, which removes the confirmed cause of the CI failure.

**TDD**: this step changes the tests themselves; the existing "Login & logout — happy path" test is the check. Before changing it, run the e2e suite and confirm the failure mode is reproducible by running the logout test followed by the password test with the `unpaidMembership` user (forced temporarily). It must fail with `session_not_found`. Afterwards it must pass.

**Acceptance criteria**:

- The test user service can create a user with a unique email and a known password, and delete it again. It is a user in the same shape as the existing test users (auth user plus `Users` row), but without a membership.
- A Playwright fixture creates such a user before a test and always deletes it afterwards, including when the test fails.
- The "Login & logout — happy path" test logs in and out with a generated user instead of `unpaidMembership`.
- After `login.spec.ts` has run, a request with the saved `unpaidMembership` session still succeeds.
- Other tests in `login.spec.ts` are unchanged.

**Notes**: the fixture and service method are introduced here because this is their first use. `routes.spec.ts` unpaid tests (`abort` / `skip` expectations) were suspected of passing with a dead session. They now run with a valid one; confirm they still pass.

### Step 2 — Use a generated user for the password test

**Goal**: "Can change password via settings" is deterministic and no longer touches shared users or their storage state.

**TDD**: the existing test is the check. It must pass 10 times in a row (run it repeatedly) with the generated user.

**Acceptance criteria**:

- The test no longer uses `randomUserTest`.
- It logs in through the UI as the generated user, changes the password, logs out, logs in with the new password, and ends. No reset of a shared user's password and no rewrite of any `.auth/*.json` file are needed.
- After clicking the change button the test waits for the success toast before asserting the check mark, so that a failure message names the real cause (for example an error toast) instead of "expected check, received Change Password".
- The generated user is removed after the test, also on failure.
- "Can reset password via email" is unchanged in this step.

**Notes**: logging in through the UI, not a storage state, is required because the user is created inside the test.

### Step 3 — Make "Log out" end only the current device's session

**Goal**: logging out on one device no longer signs the user out everywhere, which removes the cross-session revocation at its source.

**TDD**: write an e2e test first. With one generated user, log in from two separate browser contexts, log out in the first context, then confirm that the second context is still logged in (for example by reloading `/profile/settings` and expecting not to be redirected to login). It must fail before the change.

**Acceptance criteria**:

- Logging out in one browser context leaves another context's session for the same user valid.
- After logging out the user is on the login page and the local session is gone, as today.
- The existing "Login & logout" e2e test still passes.

**Notes**: the only production file expected to change is `app/components/profile/overview/LogOutCard.vue`. Search for other sign-out call sites before changing it (at the time of writing it is the only one).

### Step 4 — Add a "session expired" handler for forms

**Goal**: one reusable behaviour that recognises a revoked session error and reacts to it as agreed (decision 1).

**TDD**: write nuxt component/composable tests first. They should assert:

- Given an auth error that says the session was not found, the handler reports that it handled the error, signs out locally, navigates to the login page with the current path as `redirect`, and shows one error toast with a clear "session expired, please log in again" message.
- The same happens for the other session-gone errors from decision 7 (expired session, missing session / refresh token).
- Given an unrelated error (for example a weak password), the handler reports that it did not handle it, does not navigate, and does not sign out.
- If the local sign-out itself fails, the redirect and toast still happen.

**Acceptance criteria**:

- The handler returns a clear signal so that callers know whether they should still show their own error.
- The toast text is plain English, not the raw Supabase message.
- No existing consumer changes in this step (it is added and tested; it is first used in Step 5, which is acceptable here because a composable plus its tests is independently shippable and has no consumers to break).

**Notes**: reuse `useToast` and the existing `useWaitForAuthUser` / navigation helpers in the project; do not add a dependency.

### Step 5 — Handle a revoked session in the password form

**Goal**: a user with a revoked session who submits the password form is told what happened and sent to log in, instead of seeing a raw error and a dead page.

**TDD**: write an e2e test first. With a generated user logged in through the UI, revoke all the user's sessions through a test helper (log in with a separate client and sign out globally, as done in the research experiment), then submit the password form. Assert that the user ends up on the login page with a `redirect` back to `/profile/settings` and sees the session-expired toast. Then log in again and confirm the user lands on `/profile/settings`. It must fail before this step.

**Acceptance criteria**:

- Submitting the password form with a revoked session redirects to login with the redirect set, and shows the session-expired toast.
- Other errors keep the current error toast and the form stays usable.
- The success path is unchanged, including the check mark and the success toast.
- The helper that revokes a user's sessions lives with the test services and is used by this test.

**Notes**: the original CI failure is this exact scenario, seen from the app's side.

### Step 6 — Handle a lost session in the info form

**Goal**: the info form reacts to a lost session in the same way as the password form.

**TDD**: first confirm the real behaviour with a test. With a generated user logged in and sessions revoked, submit the info form and record what happens (the session check in the submit handler throws a 401 only when the local user is already gone; the database request may still succeed with a revoked-but-unexpired token). Write the e2e test for the behaviour that actually occurs, expecting the session-expired redirect and toast where the user is no longer authenticated.

**Acceptance criteria**:

- When the form has no authenticated user at submit time, the user is redirected to login with a redirect back and sees the session-expired toast, instead of an unhandled 401 error.
- Normal submit and error handling are unchanged.
- "Can change user information" still passes.

**Notes**: **assumption, not verified**: PostgREST validates the JWT signature and expiry, but probably not whether the session still exists, so a revoked session may not produce an error at all when saving the info. If the test shows that, this step covers only the missing-user case and the plan's Out of scope list does not change. Report the finding to the user.

### Step 7 — Warm up the dev server before e2e tests

**Goal**: the first login in the setup project does not run against a cold dev server that is still optimising dependencies and reloading.

**TDD**: not testable as a unit. Verification is by observation: locally, stop the dev server, delete the Vite dependency cache (`node_modules/.cache/vite`), start the dev server and run the setup project several times; record the number of page reloads or failures on the first login before and after the change.

**Acceptance criteria**:

- Before the setup project runs, a real browser loads the public and authenticated entry pages that tests use first (`/`, `/login`, `/profile/overview`, `/profile/settings`, `/board/rentals/form`) and waits until the page has finished loading and the page has stopped reloading.
- A first visit to `/login` in a test afterwards triggers no extra page reload.
- The setup login (`LoginPage.login`) waits until the form is interactive before filling, and no longer relies on the extended 7 s fill timeout to hide slow starts.
- Warm-up failures are reported with a clear message and do not hide real test failures. If the dev server is not reachable, the existing guard behaviour still applies.
- CI (`.github/workflows/ci.yml`) needs no change beyond what the warm-up does by itself. If it does need one, describe it in the pull request.

**Notes**: this is the unconfirmed cause (Cause B in `research.md`). If the failure still occurs after this step, capture traces for the setup project and re-investigate rather than adding further waits.

### Step 8 — Record the guardrail in the testing guidelines

**Goal**: the class of bug (a test destroying state that other tests share) is caught in review next time, per `ai-context/guardrail-gaps.md`.

**Acceptance criteria**:

- `ai-context/testing.md` has a short section stating that e2e tests that log out, change a password, or otherwise invalidate a session must use a generated user, never a shared test user or its storage state.
- The same section notes that tests must assert on the app's visible error (toast) after an action that can fail, not only on the absence of the success state.
- The final report lists the gap that was found (nothing caught a test revoking a session another test depends on), and the safety nets added (Steps 1, 3, 5, and this guideline).

## Final verification

- `yarn typecheck`, `yarn lint`, `yarn test` all pass.
- The full e2e suite passes locally, run 3 times in a row, to cover the random users still used by other tests.
