# Plan: Give the "Login & logout" e2e test its own user (step 1 of flaky-e2e-tests)

## Overview

The "Login & logout — happy path" e2e test logs in as the shared `unpaidMembership` test user and logs out. Logging out revokes every session of that user, including the saved session in `.auth/unpaidMembership.json` that other tests reuse, which makes later tests fail with `session_not_found`. This plan makes that test use a generated user that exists only for the duration of the test, and removes a second place where a shared user's sessions can be revoked by test tooling. It implements step 1 of `planning/flaky-e2e-tests/plan.md`.

## Scope

**Included**

- Confirming the failure mode before changing anything.
- Making the test helper that signs in a shared user for server tests stop revoking that user's other sessions.
- A generated, self-cleaning test user (unique email, no membership) and a Playwright fixture that provides it.
- Switching "Login & logout — happy path" to the generated user.
- Checking that the saved `unpaidMembership` session survives `login.spec.ts` and that `routes.spec.ts` unpaid tests still pass.

**Out of scope**

- Changing the app's log out behaviour (step 3 of the main plan).
- The password test (step 2), session-expired handling (steps 4–6), dev server warm-up (step 7), testing guidelines (step 8).
- Changing the other tests in `login.spec.ts`.

## Design Decisions

1. **Reproduction first**: the plan starts with a manual reproduction of the failure, so the fix is verified against a confirmed cause.
2. **Fix the sign-out in the server-test session helper**: it currently ends with a global sign-out, which can revoke a shared user's saved e2e session. It is changed so it only ends its own client's session and leaves other sessions of that user alone.
3. **Generated user shape**: unique email containing a random identifier, fixed first and last name, the default test password, no membership, not a board member. Same data shape as existing test users (auth user plus `Users` row).
4. **Cleanup**: the generated user is removed after its test, also when the test fails. It is removed together with its `Users` row.
5. **Fixture location**: next to the existing fixtures, so any e2e spec can use it. It is introduced together with its first use in the logout test.

## Prerequisites

- Local Supabase running and `.env.test` / `.env.local` configured, as for any e2e run.
- Be aware that `global.setup.ts` ("clean db") removes all users, including leftover generated ones, at the start of every run.

## Steps

### Step 1 — Reproduce the failure

**Goal**: confirm that the logout test revokes the saved `unpaidMembership` session.

**TDD**: not applicable, this is a manual observation. Temporarily force the random-user password test to use `unpaidMembership`, run the setup project, then `login.spec.ts`, then that password test. It must fail with `session_not_found`. Revert the temporary change afterwards.

**Acceptance criteria**:

- The failure and its error message are observed and noted.
- No temporary change remains in the working tree.

### Step 2 — Stop the server-test session helper from revoking other sessions

**Goal**: obtaining a session for a shared user in server tests no longer invalidates that user's other sessions.

**TDD**: write an integration test first. Sign a shared test user in with a separate client to get session A, then request a session through the helper, then assert that session A is still valid (for example a user lookup with A's access token succeeds). It must fail before the change.

**Acceptance criteria**:

- A session obtained before calling the helper remains valid afterwards.
- The helper still returns a usable session; `ServerTestService.fetch` and `test/integration/topos/library.spec.ts` keep working without changes.
- Every known consumer of the helper (search the repo before changing) still passes.

**Notes**: the helper's shared client is a secret-key client; only the sign-out scope should change, not how it signs in.

### Step 3 — Add a generated user and use it in the logout test

**Goal**: "Login & logout — happy path" logs in and out with a user created for that test alone.

**TDD**: the existing "Login & logout — happy path" test is the check; it must keep passing with the generated user. Additionally, a second assertion in the plan's verification (step 4) proves the shared user is untouched.

**Acceptance criteria**:

- The test user service can create a user with a unique email, a known password and a `Users` row but no membership, and delete it again (auth user and `Users` row).
- A Playwright fixture creates such a user before a test and always deletes it afterwards, including when the test fails.
- "Login & logout — happy path" uses the generated user instead of `unpaidMembership`; its assertions are unchanged.
- Running the test twice in a row leaves no extra users behind and does not fail on a duplicate email.
- Other tests in `login.spec.ts` are unchanged.

**Notes**: the service method and the fixture are introduced here because this is their first use. The existing creation of shared test users must keep working exactly as before (`global.setup.ts` and `resetTestUsers`).

### Step 4 — Verify the shared session survives

**Goal**: show that the original problem is gone and nothing else regressed.

**TDD**: not applicable, verification only. Run the setup project, then `login.spec.ts`, then make a request with the saved `unpaidMembership` session (for example, forced temporarily in the password test as in step 1). It must now succeed.

**Acceptance criteria**:

- After `login.spec.ts`, the saved `unpaidMembership` session still works.
- `routes.spec.ts` unpaid tests (`abort` / `skip` expectations) pass; they previously ran with a dead session and now run with a valid one.
- No temporary change remains in the working tree.
- `yarn typecheck`, `yarn lint` and `yarn test` pass, and the full e2e suite passes once.
