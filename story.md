# Plan: Authentication E2E Tests

## Overview

Add a comprehensive Playwright e2e test suite for the authentication flow of the LUAK website. Tests cover login (happy path, wrong credentials, already-logged-in redirect), signup (happy path with post-test cleanup, `auth.signUp` failure, `Users.insert` failure), password reset request (happy path, failure), and the full password reset loop (request → Inbucket email → `/passwordReset?code=` → new password set). A reusable authenticated Playwright fixture is introduced so future test files can easily start with a logged-in session for any seeded user.

## Acceptance criteria

- `yarn test:e2e` passes with all new tests green against a local Supabase instance.
- **Login — happy path**: filling valid credentials and submitting lands the user on `/profile/overview`.
- **Login — wrong user**: submitting an email which doesn't exist yet, shows inline error on password field.
- **Login — wrong password**: submitting invalid credentials shows an inline error message on the password field.
- **Login — already logged in**: navigating to `/login` while authenticated redirects to `/profile/overview`.
- **Signup — happy path**: completing the signup form creates a new `auth.users` + `Users` row, navigates to `/confirmLogin`, and the created user is deleted from both tables after the test using the Supabase admin client directly in the test process.
- **Signup — `auth.signUp` failure**: when the `POST /auth/v1/signup` request is intercepted and made to return an error, an error message is shown on the password field.
- **Signup — `Users.insert` failure**: when the `POST /rest/v1/Users` request is intercepted and made to return an error, an error message is shown on the password field.
- **Reset password request — happy path**: submitting a valid email shows the success checkmark icon and the button gains `btn-disabled`.
- **Reset password request — failure**: when `POST /auth/v1/recover` is intercepted and returns an error, an error message is shown on the email field.
- **Full password reset loop**: after requesting a reset, the Inbucket REST API (`http://localhost:54324`) is polled to retrieve the reset link; the user navigates to `/passwordReset?code=...`, submits a new password, sees the success popup, and is redirected to `/profile/overview`. The seeded password is restored via the Supabase admin client afterward.
- No test touches the production Supabase database (enforced by the existing `globalSetup.ts`).
- All pre-existing seeded users (`*@test.com` / `123456789`) are used where an existing account is needed.
- Authenticated sessions are created lazily on first use per user and cached to `tests/e2e/.auth/<email>.json` (git-ignored) for reuse by subsequent tests.

## Database changes

None — no migrations required. Cleanup (user deletion, password restore) uses the `@supabase/supabase-js` admin client instantiated directly in the Playwright test process using `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` env vars, both of which are already present in `.env` for local dev.

## Implementation tasks

### 1. Create `tests/e2e/fixtures.ts` — shared Playwright fixtures and helpers

**File:** `tests/e2e/fixtures.ts`

Extend the base Playwright `test` object and export the extended `{ test, expect }` for use in all spec files.

**Helpers (plain async functions, not fixtures):**

- **`loginAs(email: string, password: string, browser: Browser): Promise<BrowserContext>`**: checks whether `tests/e2e/.auth/{email}.json` exists. If it does, creates a context from that `storageState`. If not, creates a fresh context, navigates to `/login`, fills the form, submits, waits for `/profile/overview`, saves `context.storageState({ path })`, and returns the context. This makes sessions lazy — created on first use and reused afterward for any user.
- **`supabaseAdmin()`**: returns a `@supabase/supabase-js` client created with `createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)` using the `auth: { autoRefreshToken: false, persistSession: false }` option. Used for admin operations in test setup/teardown. `@supabase/supabase-js` is already a transitive dependency — no new package needed.
- **`deleteUser(userId: string)`**: calls `supabaseAdmin().auth.admin.deleteUser(userId)`. The `Users` row is removed by the `ON DELETE CASCADE` FK policy.
- **`restorePassword(userId: string, password: string)`**: calls `supabaseAdmin().auth.admin.updateUserById(userId, { password })`.
- **`getResetLink(mailboxName: string)`**: polls `GET http://localhost:54324/api/v1/mailbox/{mailboxName}/latest` up to 10 times with 1 s delay. Extracts the `http://localhost:3000/passwordReset?...` URL from `body.text` using a regex. Throws after 10 failed attempts.

**Fixture to add:**

- **`authenticatedPage`** (`scope: 'test'`): calls `loginAs('paid_this_year@test.com', '123456789', browser)` to get (or create) a cached context, then yields a `page` from that context. Closes the context after the test. This is the default authenticated fixture; tests needing a different user call `loginAs` directly.

---

### 2. Add `tests/e2e/.auth/` to `.gitignore`

**File:** `.gitignore`

Append one line: `tests/e2e/.auth/`

---

### 3. Create `tests/e2e/login.spec.ts` — login tests

**File:** `tests/e2e/login.spec.ts`

Import `{ test, expect }` from `./fixtures`.

#### 3a. Login — happy path
- `test.use({ storageState: { cookies: [], origins: [] } })` to ensure a clean session.
- `page.goto('/login')`.
- Fill email `paid_this_year@test.com`, password `123456789`.
- Click the submit button.
- `await expect(page).toHaveURL('/profile/overview')`.

#### 3b. Login — wrong password
- Clean session.
- Navigate to `/login`, fill valid email + `wrongpassword`, submit.
- Assert that a visible error message matching `/invalid login credentials/i` is on the page (vee-validate renders field errors as text near the input).

#### 3c. Login — already logged in redirects away
- Use `authenticatedPage` fixture (lazily logs in as `paid_this_year@test.com` and caches session).
- `page.goto('/login')`.
- `await expect(page).toHaveURL('/profile/overview')`.

---

### 4. Create `tests/e2e/signup.spec.ts` — signup tests

**File:** `tests/e2e/signup.spec.ts`

Import `{ test, expect }` from `./fixtures`. Use `test.use({ storageState: { cookies: [], origins: [] } })` for the entire file.

#### 4a. Signup — happy path
- Generate a unique email: `` `e2e_${Date.now()}@test.com` ``.
- Intercept `POST **/auth/v1/signup` via `page.route(...)` to capture the response body (`user.id` field) before forwarding it, storing `createdUserId`.
- Navigate to `/signup`, fill first name, last name, the unique email, password `TestPass123!`.
- Submit and await navigation to `/confirmLogin`.
- `afterEach`: call `deleteUser(createdUserId)` to remove both the auth row and the `Users` row.

#### 4b. Signup — `auth.signUp` failure
- `page.route('**/auth/v1/signup', route => route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ message: 'Signup is disabled' }) }))`.
- Navigate to `/signup`, fill all required fields, submit.
- Assert error message matching `/signup is disabled/i` is visible.

#### 4c. Signup — `Users.insert` failure
- Intercept `POST **/auth/v1/signup` to capture `createdUserId` before continuing (same technique as 4a).
- `page.route('**/rest/v1/Users*', route => route.fulfill({ status: 409, contentType: 'application/json', body: JSON.stringify({ message: 'duplicate key value' }) }))`.
- Navigate to `/signup`, fill all required fields, submit.
- Assert error message matching `/duplicate key value/i` is visible.
- `afterEach`: call `deleteUser(createdUserId)` to clean up the orphaned auth user.

---

### 5. Create `tests/e2e/resetPassword.spec.ts` — password reset tests

**File:** `tests/e2e/resetPassword.spec.ts`

Import `{ test, expect }` from `./fixtures`. Use `test.use({ storageState: { cookies: [], origins: [] } })` for the entire file.

Seeded user for the full loop: `paid_last_year@test.com` (UUID `ebc0eb9c-e6a5-40ce-a4f4-4d4556ce78ea`). Using this user avoids disrupting the `paid_this_year` session cached by the login fixture.

#### 5a. Reset request — failure
- `page.route('**/auth/v1/recover', route => route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ message: 'Email service unavailable' }) }))`.
- Navigate to `/resetpassword`, fill email, submit.
- Assert error message matching `/email service unavailable/i` is visible.

#### 5b. Full password reset loop
- `page.goto('/resetpassword')`, fill `paid_last_year@test.com`, submit.
- Assert the button has class `btn-disabled` (success state of the request step).
- Assert a `check` icon (`.material-symbols-outlined` with text `check`) is visible.
- Call `getResetLink('paid_last_year')` to poll Inbucket at `http://localhost:54324/api/v1/mailbox/paid_last_year/latest` and extract the `/passwordReset?code=...` URL.
- `page.goto(resetLink)`.
- Fill `pwd1` = `pwd2` = `NewPass456!`, submit.
- Assert the success toast `<pop-up>` containing `/password updated successfully/i` is visible.
- `await expect(page).toHaveURL('/profile/overview')` (after the 800 ms redirect).
- `afterEach`: call `restorePassword('ebc0eb9c-e6a5-40ce-a4f4-4d4556ce78ea', '123456789')` to set the password back so subsequent test runs work with the seeded credentials.

---

## Out of scope

- Form validation error tests (weak password, missing required fields, phone format).
- Middleware / route-guard tests (`unauthenticated` guard, board guard, active-member guard).
- OAuth / magic-link flows.
- Testing the `/confirmLogin` callback page behaviour beyond verifying the URL after signup.
- Stripe payment flows.
- Visual regression or accessibility testing.
- Testing browsers other than Chromium (single project in existing config).
