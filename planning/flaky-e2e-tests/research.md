# Research: flaky e2e tests on CI

## Summary

The CI run had 1 failed test, 1 flaky test, and 61 passing tests (`logs.txt`).

1. **`profile-settings.spec.ts:44` "Can change password via settings" (confirmed root cause, deterministic for one user).**
   The test picks a random user. When that user is `unpaid_membership@test.com`, the Supabase session stored in its storage-state file has already been revoked by an earlier test (`login.spec.ts` "Login & logout"). The password change then fails with HTTP 403 `session_not_found`, the form silently returns to "Change Password" (no assertion on the error toast), and the test fails. Whether it fails depends on which user `randomOf` picks, so the same code passes or fails from run to run.
2. **`global.setup.ts` "login test users - nonMember" (probable cause, not confirmed).** The first attempt failed while the login form was still in its pre-hydration state and the page navigated again. This looks like a cold-start issue with `yarn nuxt dev` in CI. The retry passed.

Both points are explained below.

---

## Evidence

### 1. Logs and report

| Item | Observation |
|---|---|
| `logs.txt` | `profile-settings.spec.ts:44` failed on attempt 1 and on retry #1 with the same symptom: `change-password-button` goes `loading` then back to `Change Password`, never `check`. |
| `logs.txt` | `global.setup.ts:14` "login test users - nonMember" failed once, then passed on retry. Error: `input disabled`, "navigated to /login", "element was detached from the DOM". |
| Report `data/*.md` (`f25e...`, `5b10...`) | Page snapshot for the password test shows the button back in state `Change Password`. No error toast is captured in the snapshot. |
| Trace `ac930264...` (password test, retry #1) | Network log has a single request that fails: `PUT http://127.0.0.1:54321/auth/v1/user -> 403 {"code":"session_not_found","message":"Session from session_id claim in JWT does not exist"}`. |
| Same trace, JWT in that request | `sub` is `0a3f3f32-...`, `email: unpaid_membership@test.com`. So this retry ran as `unpaidMembership`. |
| Trace `8929...` (setup, retry, passing) | Cold first load of `/login` requests dozens of `node_modules/.cache/vite/client/deps/*` modules. One request ends with status `-1` (aborted). `[vite] connecting` / `[vite] connected` are logged about 3 s into the test. |

The attempt-1 trace of the password test (`5b10...`) and the attempt-1 trace of the setup test are not in the report. Only error context for them is available. The user chosen for attempt 1 of the password test is therefore unknown.

### 2. Code path for the password test

- `test/e2e/profile-settings.spec.ts:44` uses `randomUserTest`, so `user = randomOf(Object.keys(testUsers))` (`test/e2e/fixtures.ts`, `shared/utils/utils.ts:96`). Each test gets a random user and that user's `storageState` file (`test/e2e/.auth/<user>.json`).
- The storage-state files are written once in the setup project (`global.setup.ts`), one per user, via `login()`.
- `test/e2e/login.spec.ts:7` "Login & logout — happy path" logs in as `unpaidMembership` and clicks logout. Logout runs `supabase.auth.signOut()` (`app/components/profile/overview/LogOutCard.vue:7`).
- Playwright runs the files alphabetically on 1 worker: `login.spec.ts` (line 7) runs before `profile-settings.spec.ts` (line 44). Confirmed with `yarn playwright test --list`.
- `app/components/profile/overview/Update/Password.vue` calls `supabase.auth.updateUser({ password })`. On error it only shows a toast (`showToast('error', ...)`). The button goes back to its initial state and the test has no assertion on the toast, so the failure surfaces only as "expected `check`, received `Change Password`".

### 3. Experiment: does global logout revoke a stored session?

Script (run against local Supabase at `127.0.0.1:54321`, deleted afterwards):

1. Sign in `unpaid_membership@test.com` twice -> sessions A and B.
2. `POST /auth/v1/logout?scope=global` with session B.
3. `GET /auth/v1/user` with session A.

Result:

```
before logout, session A: 200
global logout of session B -> HTTP 204
after global logout, session A: 403 {"code":403,"error_code":"session_not_found", ...}
```

This is the same error seen in CI. Supabase's default `signOut()` scope is `global` (`node_modules/@supabase/auth-js` 2.112.3). A global logout invalidates every session of that user, including the one saved in `.auth/unpaidMembership.json` during setup.

Side effect: the experiment created and revoked two sessions for `unpaid_membership@test.com` in the local DB. The DB is reset on each e2e run by `global.setup.ts` ("clean db"), so nothing else is affected.

---

## Possible causes

### Cause A (confirmed): stale shared storage state after a global logout

Chain:

1. Setup logs every test user in and saves one storage state per user.
2. `login.spec.ts` logs `unpaidMembership` out globally. This revokes the saved session for that user.
3. Any later test that uses `unpaidMembership` through `storageState` starts with a dead session.
4. `randomUserTest` picks `unpaidMembership` at random 1 time out of 5, so the password test fails 1 time out of 5 (on average, per attempt).

Steps 1-3 are confirmed by the trace and the experiment. Step 4 follows from `randomOf` over 5 users. Not every later run hits `unpaidMembership`, which is why the failure is intermittent.

Other tests that use shared storage states after `login.spec.ts` (alphabetically `profile-settings`, `rentals`, `routes`, `signup`, `topo-library`) are exposed to the same problem, but only if they pick the user that was logged out:

- `routes.spec.ts` runs `unpaidMembership` tests with `storageState` after `login.spec.ts`. Their expected results (`abort`, `skip`) would look the same for a dead session as for a logged-out visitor, so they may pass without testing the right thing. **Assumption, not verified.**

### Cause B (probable, not confirmed): cold-start dev server during setup login

Evidence:

- CI starts `yarn nuxt dev` and does not warm it up. The first page visit compiles modules and optimises Vite dependencies on demand. The passing trace shows dozens of `vite/client/deps` requests during the first `/login` load, and one of them is aborted.
- The failing attempt has the login input in the state the `SharedInput` component (`app/components/shared/input/index.vue:23`) gives it before `onMounted`: `_disabled = true`, so the input is `disabled`. Playwright's `fill` keeps waiting for it to be enabled.
- The log says the page navigated to `/login` again during `fill`, and the element was then detached and re-attached. That fits a full reload, for example Vite's "new dependencies optimized, reloading" after the first visit.

What is missing:

- The failing attempt's trace is not in the report, so I cannot confirm the reload.
- The reload could also be caused by something in the app. I did not find an explicit navigation in the login flow that would cause it.

### Cause C (contributing, not a cause by itself): hydration gating in shared components

`Button.vue` (`app/components/shared/Button.vue:17`) and `shared/input/index.vue` both start disabled and only become enabled in `onMounted`. Playwright waits for enabled elements, so this is usually fine. But it lets a test interact with a control before its handlers are attached, which is what Cause B would expose. I did not verify that a fill before hydration loses values.

### Cause D (contributing, risk only): randomised user and no cleanup on failure

- `randomOf` makes the failing user different on each run, so the failure is hard to reproduce. A test that always used the same user would fail every time, which would be easier to diagnose.
- `Can change password via settings` changes the password of the chosen user and only restores it on success. If the test fails after `updateUser`, the user keeps `NewPassword123!` until the next run's setup resets users. Other tests that log in as that user with the default `password` will then fail. **Not observed in these logs.**
- `CI` has `retries: 1`. Both failures were retried and classified as `flaky` or `failed` by the retry result, which hides how often they happen.
- `Can change user information` uses `sleep(200)` before reading the database. This is a timing guess, not a condition.

---

## Assumptions and open questions

- **Assumed:** The attempt-1 failure of the password test was also `unpaidMembership`. I could not confirm this because its trace is not in the report. The attempt-1 error text is consistent with the same cause, but the artifacts don't prove it.
- **Assumed:** The setup-login failure was caused by a page reload during cold start. Not confirmed: its trace is missing and I did not reproduce a cold start locally.
- **Not checked:** Whether the `routes.spec.ts` unpaid tests are passing only because of the dead session.
- **Not checked:** The CI workflow runs `yarn nuxt dev` in the background with no warm-up, and `playwright.config.ts` sets `webServer.reuseExistingServer: true`. I did not reproduce the CI timing locally.
- **Not checked:** The contents of the e2e `.auth/*.json` files on CI. I assume they are generated fresh in the setup project on each run.
