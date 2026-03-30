# Plan: Guard E2E Tests Against the Production Database

## Overview

`SUPABASE_URL` and `SUPABASE_KEY` in `.env` currently point to production, so running `yarn test:e2e` or even `yarn dev` silently hits the live database. The fix introduces **environment-specific `.env` files**: `.env.local` (committed, safe, the default for local dev and tests) and `.env.production` (gitignored, production credentials). All scripts default to local. A `globalSetup` guard in Playwright makes it structurally impossible to run e2e tests against the production database, even if someone explicitly passes a production env file.

---

## Acceptance criteria

- `yarn dev` starts the Nuxt dev server pointing to the local Supabase instance without any extra flags.
- `nuxt dev --dotenv .env.production` starts the dev server pointing to production (opt-in, explicit).
- `yarn test:e2e` always connects to the local Supabase instance, regardless of what `.env` or `.env.production` contain.
- Running `yarn test:e2e` while `SUPABASE_URL` resolves to the production host exits immediately with a non-zero code and a clear error message, before any browser or dev server launches.
- Production credentials (`SUPABASE_URL`, `SUPABASE_KEY`) are never present in any committed file.
- `.env.local` (local credentials) is committed so every developer and CI environment gets working local defaults out of the box.
- `.env.example` is updated to document the new file layout.

---

## Implementation tasks

### 1. Create `.env.local` with local Supabase credentials

**What:** New file `.env.local`.

**How:** Move the local Supabase values from the current `.env` into this file. The local anon key is not a secret — it only grants access to the ephemeral local database that lives on the developer's machine.

```
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_KEY=sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
```

---

### 2. Create `.env.production` with production credentials

**What:** New file `.env.production`.

**How:** Move the production `SUPABASE_URL` and `SUPABASE_KEY` values from the current `.env` into this file.

```
SUPABASE_URL=https://cpjapefpqxrptkzeehyd.supabase.co
SUPABASE_KEY=<production-anon-key>
```

This file is **gitignored** (covered by the existing `.env.*` rule in `.gitignore`) and must never be committed.

---

### 3. Clean up `.env` — remove Supabase credentials

**What:** Modify `.env`.

**How:** Remove all `SUPABASE_URL` and `SUPABASE_KEY` lines (both the commented-out local lines and the active production lines). Keep only the environment-agnostic variables that apply in both environments:

```
BASE_URL=http://localhost:3000

NUXT_PUBLIC_PAYMENT_LINK_MEMBERSHIP=
NUXT_PUBLIC_PAYMENT_LINK_MEMBERSHIP_DISCOUNT=

STUDIO_GITHUB_CLIENT_ID=
STUDIO_GITHUB_CLIENT_SECRET=
STUDIO_GITHUB_MODERATORS=
```

---

### 4. Update `package.json` — default `yarn dev` to `.env.local`

**What:** Modify `package.json`, `scripts` section.

**How:** Add `--dotenv .env.local` to the `dev` script only:

```json
{
  "scripts": {
    "dev": "nuxt dev --dotenv .env.local",
    "build": "nuxt build",
    "generate": "nuxt generate",
    "preview": "NODE_OPTIONS='--import ./public/instrument.server.mjs' nuxt preview",
    "test:e2e": "playwright test"
  }
}
```

`build`, `generate`, and `preview` are left unchanged — they run in production (Vercel), where env vars are injected by the platform, not from a local file.

---

### 5. Update `playwright.config.ts` — add `globalSetup` and lock `webServer` env

**What:** Modify `playwright.config.ts`.

**How:** Two changes:

a. Add `globalSetup: './tests/e2e/globalSetup.ts'` to the `defineConfig` object.

b. Add an `env` block to `webServer` that hardcodes the local Supabase values for the `yarn dev` child process. This is independent of any `.env` file on disk:

```ts
webServer: {
  command: 'yarn dev',
  url: 'http://localhost:3000',
  reuseExistingServer: !process.env.CI,
  timeout: 120_000,
  stdout: 'ignore',
  stderr: 'pipe',
  env: {
    ...process.env,
    SUPABASE_URL: 'http://127.0.0.1:54321',
    SUPABASE_KEY: '<local-anon-key>',
  },
},
```

Use the same local anon key value as in `.env.local` (task 1). The `...process.env` spread preserves all other env vars (e.g. `BASE_URL`, `PATH`) so the dev server starts correctly.

---

### 6. Create `tests/e2e/globalSetup.ts` — the production-URL hard abort

**What:** New file `tests/e2e/globalSetup.ts`.

**How:** Playwright's `globalSetup` runs before any browser or `webServer` is started. Read `SUPABASE_URL` from `process.env` (which at this point reflects the shell environment, not the `webServer.env` override) and exit immediately if it matches the production host.

```ts
const PRODUCTION_SUPABASE_HOST = 'cpjapefpqxrptkzeehyd.supabase.co';

export default function () {
  const supabaseUrl = process.env.SUPABASE_URL ?? '';
  if (supabaseUrl.includes(PRODUCTION_SUPABASE_HOST)) {
    console.error(
      '\n❌  E2E tests cannot run against the production Supabase database.\n' +
        `   SUPABASE_URL is currently set to: ${supabaseUrl}\n` +
        '   Ensure SUPABASE_URL=http://127.0.0.1:54321 (start local Supabase with: supabase start)\n',
    );
    process.exit(1);
  }
}
```

---

### 7. Update `.gitignore` — un-ignore `.env.local`

**What:** Modify `.gitignore`.

**How:** The existing rule `.env.*` gitignores all `.env.*` files. Add an explicit exception for `.env.local` alongside the existing `.env.example` exception:

```
# Local env files
.env
.env.*
!.env.example
!.env.local
```

---

### 8. Update `.env.example` — document the new file layout

**What:** Modify `.env.example`.

**How:** Replace the current content with documentation of the three-file layout:

```
# Shared, non-sensitive variables — committed, used in all environments.
BASE_URL=http://localhost:3000

NUXT_PUBLIC_PAYMENT_LINK_MEMBERSHIP=
NUXT_PUBLIC_PAYMENT_LINK_MEMBERSHIP_DISCOUNT=

# Github oAuth for Nuxt Studio in Production
# Find at github.com/settings/developers
STUDIO_GITHUB_CLIENT_ID=
STUDIO_GITHUB_CLIENT_SECRET=
# Restrict Nuxt Studio access to specific email addresses (comma-separated)
STUDIO_GITHUB_MODERATORS=

# ---------------------------------------------------------------------------
# Environment-specific files (never committed except .env.local)
# ---------------------------------------------------------------------------
# .env.local      — committed — local Supabase credentials for dev & tests
#                   SUPABASE_URL=http://127.0.0.1:54321
#                   SUPABASE_KEY=<local anon key — run: supabase status>
#
# .env.production — gitignored — production Supabase credentials
#                   SUPABASE_URL=https://<project-ref>.supabase.co
#                   SUPABASE_KEY=<production anon key>
#                   Usage: nuxt dev --dotenv .env.production
```

---

## Out of scope

- Adding a staging/preview Supabase project (only local and production exist).
- Setting up GitHub Actions CI to run the tests automatically.
- Rotating the production anon key that was previously committed in `.env` (a separate security remediation task — should be done on the Supabase dashboard).
- Adding further e2e tests beyond the existing homepage smoke test.
