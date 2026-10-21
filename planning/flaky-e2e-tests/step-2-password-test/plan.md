# Plan: Use a generated user for the password test (Step 2 of flaky-e2e-tests)

## Overview

"Can change password via settings" currently runs as a random shared test user, changes that user's password, and then has to restore the password and rewrite the user's saved login session. When it picks the wrong user, or fails halfway, other tests are affected. This plan makes the test run as a throwaway user that exists only for this test, so nothing shared is touched and no cleanup of shared state is needed. It also makes a failure explain itself, by waiting for the success message before checking the result.

## Scope

**Included**

- Rewriting "Can change password via settings" in `test/e2e/profile-settings.spec.ts` to use the existing generated-user fixture.
- Logging in through the UI as that user.
- Waiting for the success toast before asserting the check mark.
- Making the toast reachable from the settings page object (introduced at its first use).
- Removing the password reset and the saved-session rewrite from this test.
- Verifying stability by running the test 10 times in a row.

**Out of scope**

- "Can reset password via email" (unchanged, still uses a random shared user).
- "Can change user information" (unchanged).
- Changing the app's log out behaviour (Step 3) or any production code.
- Changing the fixture, the test user service, or the login page object, unless a verification run shows they must change (then report it, do not silently widen the step).

## Design Decisions

1. **Which user**: the test uses the existing generated-user fixture (same one as "Login & logout — happy path"). The user has no membership, which is enough for the settings page.
2. **How the test gets a session**: the user is created inside the test, so no saved session exists. The test logs in through the UI, using the shared login helper.
3. **Final state**: the test ends after logging in with the new password. It does not reset the password, because the fixture deletes the user afterwards, also on failure.
4. **Success wait**: after clicking the change button, the test first expects a toast with the success message, then expects the check mark on the button. The message is the one the form already shows: "Password changed successfully."
5. **Toast locator**: added to the settings page object as a locator for the app's toast element (it already has a stable test id). It is added in this step because this test is its first user.
6. **New password value**: unchanged from today's test.
7. **Verification**: the single test is repeated 10 times in a row, as the parent plan requires. Since the test no longer has a random element, this checks for timing flakiness only.

## Prerequisites

- Local Supabase running and `.env.test` configured, as for any e2e run.
- The generated-user fixture and the user service's create/delete methods already exist (added in Step 1). Nothing else is needed.
- The global setup removes all users at the start of each run, so a repeated run must start from a clean state. The fixture's own cleanup keeps repeated runs from accumulating users.

## Steps

### Step 1 — Run the test as a generated user

**Goal**: the password test no longer depends on or modifies any shared test user or saved session.

**TDD**: the existing test is the check. Before changing it, run it once to confirm it passes today. After the change it must still pass.

**Acceptance criteria**:

- The test no longer uses the random-user test wrapper, and no longer reads a saved session.
- The test logs in through the UI as the generated user, goes to the settings page, changes the password, logs out, and logs in again with the new password.
- The password reset and the saved-session rewrite are gone from this test.
- After the test finishes (pass or fail), the generated user no longer exists.
- No `.auth/*.json` file changes as a result of running the test. This can be checked by confirming the files are unchanged in git status after a run.
- "Can reset password via email" and "Can change user information" are unchanged and still pass.

**Notes**: imports that become unused (for example the saved-session helper, if nothing else in the file needs it) must be removed. The two other tests in the file still use the random-user wrapper and the saved-session helper, so check before removing anything. The login step must not rely on the generated user having a membership.

### Step 2 — Wait for the success toast before asserting the check mark

**Goal**: when the password change fails, the test failure names the real cause (for example an error toast) instead of "expected check, received Change Password".

**TDD**: this is a test-only change, so the check is a deliberate failure. Temporarily make the new password too weak to be accepted (or otherwise force an error toast) and run the test. The failure message must point at the missing success toast (and show the error toast text where the reporter allows), not at the button text. Revert the forced failure afterwards.

**Acceptance criteria**:

- The settings page object exposes the toast.
- After clicking the change button, the test expects the success toast with the message "Password changed successfully." and only then expects the check mark.
- With a forced error, the failure is reported on the toast expectation.
- With the normal password, the test passes.

**Notes**: the toast also appears on error, so the expectation must match the success message text, not just the toast's presence.

### Step 3 — Prove the test is stable

**Goal**: confirm the test is deterministic, as the parent plan requires.

**TDD**: not applicable, this is verification only.

**Acceptance criteria**:

- The password test passes 10 times in a row when run repeatedly in one invocation.
- After the repeated run, no generated users remain in the database (the user list contains only the standard test users after the next setup, and no leftovers from the run itself).
- The whole `profile-settings.spec.ts` file passes once.
- `yarn typecheck` and `yarn lint` pass.

**Notes**: if any repetition fails, do not add waits or retries. Read the failure message (now naming the real cause thanks to Step 2) and report it to the user before changing anything else. Findings that affect other steps of the parent plan (for example a slow settings page for a user without membership) are reported, not fixed here.
