# Plan: Fix Unsafe Production DB Guard in E2E Tests (Option A)

## Problem

`tests/e2e/globalSetup.ts` reads `process.env.SUPABASE_URL` from the **Playwright
runner process**. This is structurally wrong: the runner process has no reliable
knowledge of the environment inside the web server that will actually handle test
requests.

The gap opens because `playwright.config.ts` sets:

```ts
reuseExistingServer: !process.env.CI,
```

When `CI` is unset (i.e., every local run), Playwright detects any process already
listening on port 3000 and reuses it without starting a new one. The guard then
checks the runner's own env — which is empty if the developer launched the dev
server with `nuxt dev --dotenv .env.production` in a separate terminal — and passes
silently. Tests run against the live production database.

---

## Solution: Health-Check Endpoint

Add a Nuxt server route at `GET /api/_test-guard` that returns the value of
`SUPABASE_URL` as seen by the **running Nuxt process**. Replace the env check in
`globalSetup.ts` with an HTTP request to this endpoint.

This is correct by construction: the endpoint lives inside the exact process that
will serve all test requests. It cannot be fooled by how the server was started or
which terminal the developer used.

### Timing guarantee

Playwright's execution order is:
1. `webServer` starts (or existing server is confirmed reachable on port 3000).
2. `globalSetup` runs.
3. Tests run.

`globalSetup` is always called after the server is healthy, so the HTTP request
to `/_test-guard` is guaranteed to succeed as long as the server is up.

---

## Implementation Tasks

### Task 1 — Create the server route

**File to create:** `server/api/_test-guard.get.ts`

Nuxt auto-discovers all files under `server/api/` and registers them as H3 event
handlers. The `.get.ts` suffix restricts the route to `GET` requests only.
The `_` prefix on the filename is conventional for internal/non-public routes and
has no functional effect; it signals intent.

The route must:
- Return a 404 in production so it is inert on Vercel and in any production build.
- Return `{ supabaseUrl: string }` in all other environments.

`process.env.NODE_ENV` is set to `'production'` by Nuxt during `nuxt build` /
`nuxt generate` / `nuxt preview`, and to `'development'` during `nuxt dev`.

```ts
// server/api/_test-guard.get.ts
export default defineEventHandler(() => {
  if (process.env.NODE_ENV === 'production') {
    throw createError({ statusCode: 404 });
  }
  return { supabaseUrl: process.env.SUPABASE_URL ?? '' };
});
```

Notes:
- `defineEventHandler` and `createError` are auto-imported by Nitro (Nuxt's server
  engine); no import statements are needed.
- No authentication or rate-limiting is required. The endpoint only exposes
  `SUPABASE_URL`, which is not a secret (it is a public API URL, not a key), and
  is disabled entirely in production.
- The file sits in `server/api/`, not `server/routes/api/`. Both conventions work
  in Nuxt 3, but `server/api/` is the standard location for first-party API
  endpoints and is already used by `@nuxtjs/supabase` internals.

---

### Task 2 — Rewrite `globalSetup.ts`

**File to modify:** `tests/e2e/globalSetup.ts`

Replace the current synchronous env check with an async function that:
1. Creates a Playwright `APIRequestContext`.
2. Calls `GET http://localhost:3000/api/_test-guard`.
3. Aborts with a clear message if the response is not `200 OK`.
4. Parses `supabaseUrl` from the JSON body.
5. Aborts with a clear message if `supabaseUrl` contains `supabase.co`.
6. Disposes the request context.

```ts
// tests/e2e/globalSetup.ts
import { request } from '@playwright/test';

export default async function () {
  const ctx = await request.newContext({ baseURL: 'http://localhost:3000' });

  let supabaseUrl: string;
  try {
    const res = await ctx.get('/api/_test-guard');
    if (!res.ok()) {
      console.error(
        `\n❌  Safety check failed — /api/_test-guard returned HTTP ${res.status()}.\n` +
          '    Ensure the dev server is running and NODE_ENV is not "production".\n',
      );
      process.exit(1);
    }
    ({ supabaseUrl } = await res.json());
  } catch (err) {
    console.error(
      '\n❌  Safety check failed — could not reach http://localhost:3000/api/_test-guard.\n' +
        `    ${err}\n`,
    );
    process.exit(1);
  } finally {
    await ctx.dispose();
  }

  if (supabaseUrl!.includes('supabase.co')) {
    console.error(
      '\n❌  E2E tests cannot run against the production Supabase database.\n' +
        `    The running server is using SUPABASE_URL="${supabaseUrl!}".\n` +
        '    Stop the server, start local Supabase with "supabase start", and retry.\n',
    );
    process.exit(1);
  }
}
```

Notes:
- The function must be `async` because `request.newContext()` and `ctx.get()` are
  Promises. Playwright supports async `globalSetup` functions.
- `baseURL` is set on the context so the route path can be relative; this also
  makes it easy to change the port in one place if needed.
- The `try/catch` handles network-level failures (server not up, ECONNREFUSED)
  separately from HTTP-level failures (non-200 status), giving the developer a
  precise error message in each case.
- `ctx.dispose()` is called in `finally` to release the HTTP connection pool
  regardless of outcome.

---

## Files Changed

| File | Action | Purpose |
|---|---|---|
| `server/api/_test-guard.get.ts` | **Create** | Exposes server-side `SUPABASE_URL`; 404 in production |
| `tests/e2e/globalSetup.ts` | **Modify** | Replaces env check with HTTP check against the endpoint |

No other files need to change. No new dependencies are introduced (`@playwright/test`
already provides `request`). No `nuxt.config.ts` changes are needed — Nuxt
auto-discovers `server/api/` files.

---

## Todo

- [ ] Create `server/api/_test-guard.get.ts`
  - [ ] Return 404 when `process.env.NODE_ENV === 'production'`
  - [ ] Return `{ supabaseUrl: process.env.SUPABASE_URL ?? '' }` in all other environments
- [ ] Rewrite `tests/e2e/globalSetup.ts`
  - [ ] Change the function signature to `async`
  - [ ] Import `request` from `@playwright/test`
  - [ ] Create an `APIRequestContext` with `baseURL: 'http://localhost:3000'`
  - [ ] Call `GET /api/_test-guard` and abort with a clear error on non-200 response
  - [ ] Parse `supabaseUrl` from the JSON response body
  - [ ] Abort with a clear error if `supabaseUrl` contains `supabase.co`
  - [ ] Dispose the request context in `finally`
- [ ] Verify: reused production server is blocked
  - [ ] Start `nuxt dev --dotenv .env.production`, then run `yarn test:e2e` — must exit with code 1 before any test runs
- [ ] Verify: normal local path still works
  - [ ] With `supabase start` running and no existing server on port 3000, run `yarn test:e2e` — must pass

---

## Verification

After implementing, manually verify both failure and success modes:

1. **Reused production server (the original bug):**
   - Start `nuxt dev --dotenv .env.production` in one terminal.
   - Run `yarn test:e2e` in another terminal.
   - Expected: `globalSetup` prints the `supabase.co` error and exits with code 1
     before any test runs.

2. **Normal local dev path:**
   - `supabase start` running, no existing server on port 3000.
   - Run `yarn test:e2e`.
   - Expected: Playwright starts the server via `yarn dev` (which loads `.env.local`),
     `globalSetup` sees `http://127.0.0.1:54321`, and tests run normally.
