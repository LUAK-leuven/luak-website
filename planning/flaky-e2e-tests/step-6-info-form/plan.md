# Plan: Handle a lost session in the info form (Step 6 of flaky-e2e-tests)

## Overview

The info form on the settings page throws an unhandled 401 when the user is no longer authenticated at submit time, so the user sees nothing and the form looks dead. This plan makes the info form react the same way as the password form: the user is redirected to the login page with a way back and sees the "session expired" toast. To let both forms share the reaction without sharing a fake error, the session-expired handler is first changed so that it only performs the reaction, and callers decide whether the reaction applies. The plan also records what really happens when the info form is submitted with a revoked session.

## Scope

**Included**

- Changing `useSessionExpiredHandler` so it is only responsible for the reaction (sign out locally, redirect to login, toast), not for checking errors.
- Updating its existing consumer (`Update/Password.vue`) and its tests to the new shape.
- An e2e check that records what happens when the info form is submitted with a revoked session.
- Handling the "no authenticated user at submit time" case in `Update/Info.vue`.

**Out of scope**

- The 401 thrown while loading the form (`useAsyncData` in `Update/Info.vue`); the route middleware already redirects unauthenticated users on load.
- Reworking how `Update/Info.vue` reports non-session errors (they still go to the newsletter field).
- Adding a session check before saving. If a revoked-but-unexpired session saves silently, that is reported, not fixed.
- An app-wide auth listener.
- Changing `isSessionGoneError`, `useToast` or the login page.

## Design Decisions

1. **Responsibility split**: `useSessionExpiredHandler` only performs the reaction. Callers decide whether to call it. The error check stays in `isSessionGoneError`, which callers use themselves.
2. **Handler shape**: the handler takes no error argument and no longer returns a "handled" signal. It always signs out locally, redirects to login with the current full path as `redirect`, and shows the toast. A failing local sign-out still does not block the redirect and the toast.
3. **Password form after the refactor**: it checks the error with `isSessionGoneError` and, when it matches, calls the handler and stops. Other errors keep today's toast. Behaviour is unchanged for the user.
4. **Info form, no user at submit time**: instead of throwing the 401, it calls the handler and stops. No fake error object is created.
5. **Info form, revoked session**: the e2e test records the real behaviour. If the save succeeds silently (expected, because the database request only validates the token's signature and expiry), no production change is made for it and the finding goes in the final report. The recorded behaviour stays in the test suite as a characterisation test only if it is stable; otherwise it is removed and only reported.
6. **Existing tests**: the composable tests that covered error classification ("not handled" for unrelated errors and for no error) move out of the handler. Classification remains covered by `test/integration/auth/sessionGoneError.spec.ts`; the Password form keeps its e2e coverage from Step 5.

## Prerequisites

- Local Supabase running and `.env.test` / `.env.local` configured, as for any e2e run.
- Steps 1 to 5 of `planning/flaky-e2e-tests/plan.md` are done (generated-user fixture, `revokeAllSessions`, the handler, and the Password form wiring).

## Steps

### Step 1 — Make the handler perform the reaction only

**Goal**: the handler no longer checks errors, and the password form does the check itself with no change in behaviour.

**TDD**: first change the composable tests to the new shape: calling the handler signs out with local scope once, redirects to login with the current full path as `redirect`, shows exactly one error toast with the session-expired text (not any Supabase message), and still redirects and toasts when the local sign-out fails by error result or by throwing. Remove the tests that only exist for classification (unrelated errors, null error, the per-code cases). The changed tests must fail before the composable changes. Keep the Step 5 e2e test ("Change password with a revoked session redirects…") green as the check on the password form.

**Acceptance criteria**:

- The handler takes no error argument and does not use `isSessionGoneError`.
- `Update/Password.vue` calls the handler only when `isSessionGoneError` matches the error, then stops; other errors still show the error toast, and the success path is unchanged.
- No other consumer of the handler exists (confirm with a search for `useSessionExpiredHandler`).
- The Step 5 password e2e test, "Can change password via settings", composable tests, `yarn typecheck` and `yarn lint` pass.

**Notes**: this step changes the public shape of the composable, so its only consumer (the password form) is updated here. The coverage dropped from the composable tests must still exist elsewhere: check that the integration test covers each of the four codes and the missing-session class before deleting the composable tests.

### Step 2 — Record what happens when the info form is submitted with a revoked session

**Goal**: replace the unverified assumption in the parent plan with an observed fact.

**TDD**: this is the investigation. Write an e2e test with a generated user logged in through the UI, on the settings page, with all sessions revoked through `revokeAllSessions`, then change a field in the info form and submit. Run it against the current code and record the outcome: where the user ends up, which toast or field error appears, and whether the change is saved in the database. Then write the assertion for the behaviour that actually occurs.

**Acceptance criteria**:

- The observed outcome is written down for the final report (redirect, silent success, or error on the newsletter field).
- If the outcome is a silent success: the test asserts the user stays on the settings page and the change is saved, and a short comment in the test names the reason. If this proves unstable, the test is removed and the finding is only reported.
- If the outcome is a redirect or a session error: stop and ask the user before continuing, because the plan's scope would change.
- Production code is unchanged in this step.

**Notes**: the form's success state shows a check mark; assert on the visible outcome (check mark, toast, URL) rather than the absence of one, per the guideline planned in Step 8 of the parent plan.

### Step 3 — Redirect to login when the info form has no user at submit

**Goal**: submitting the info form with no authenticated user shows the session-expired toast and redirects to login with a way back, instead of an unhandled 401.

**TDD**: first write the test, then watch it fail.

- Preferred: an e2e test where a generated user is logged in through the UI on the settings page, the user is then signed out locally from a second tab in the same browser context, and the info form in the first tab is submitted. Assert the URL becomes `/login?redirect=/profile/settings` and the session-expired toast is shown. Whether the sign-out reaches the first tab through the Supabase client's cross-tab sync must be confirmed while writing the test.
- If that does not clear the first tab's user, use a Nuxt component test for `Update/Info.vue` instead: mount it with a user present, set the user to empty, submit, and assert that the handler's reaction happens (redirect to login with the current path as `redirect`, one toast) and that no database update is attempted.

**Acceptance criteria**:

- With no authenticated user at submit, the user is redirected to login with `redirect` set to the current page and sees the session-expired toast.
- No 401 error is thrown from the submit handler in that case.
- Re-logging in lands the user back on `/profile/settings` (covered by the e2e variant, otherwise by the existing login redirect behaviour from Step 5).
- Normal submit and database error handling (field error on newsletter) are unchanged.
- "Can change user information" still passes.

**Notes**: the load-time 401 in `useAsyncData` stays as it is. The `@ts-expect-error` on the update call is untouched.

### Step 4 — Final verification

**Goal**: confirm the step is shippable and report the findings.

**Acceptance criteria**:

- `yarn typecheck`, `yarn lint`, `yarn test` pass; the settings e2e tests pass (`profile-settings.spec.ts`) 3 times in a row.
- The final report states: what really happened when the info form was submitted with a revoked session (Step 2), whether the parent plan's assumption held, and that the parent plan's Out of scope list is unchanged.
- Guardrail gap check per `ai-context/guardrail-gaps.md`: this step fixes the unhandled 401 for a lost session, which no earlier check would have caught. The e2e or component test added in Step 3 is the new guardrail; state this in the report.
