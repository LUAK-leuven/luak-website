# LUAK website

The techstack used for this project is:

- Nuxt
- Nuxt Content + Nuxt Studio (visual content editing)
- Tailwindcss + Daisyui

- Supabase for the backend: https://supabase.com/dashboard/project/cpjapefpqxrptkzeehyd
- Vercel for deployment: https://vercel.com/luak-leuvens-projects/luak-website/

- ~~Sentry for observability~~
- Stripe for payments

## Setup

1. Install [Docker](https://docs.docker.com/desktop/setup/install/) (or [podman](https://podman-desktop.io))
2. Install Node 22.x.x (for example using [asdf](https://asdf-vm.com): `asdf install nodejs 22.23.2`)
3. Install [yarn](https://classic.yarnpkg.com/en/docs) using [corepack](https://corepack.org): `corepack enable && corepack prepare yarn@1.22.22 --activate`
4. Install packages: `yarn install`

Next set the right env variables to connect with supabase. check `.env.example` and the [Supabase Docs](https://supabase.com/docs/guides/getting-started)

### e2e-tests

Firs you need to install the [playwright](https://playwright.dev) browsers: `yarn playwright install chromium`


## Nuxt Studio

Visual content editing is available through Nuxt Studio.

**Quick start (dev mode):**
- Run `yarn dev`
- The local server should be running on http://localhost:3000

To run against the production database: `yarn dev --dotenv .env.production`

## Test users

Some test users are created when running the e2e tests. If you need them for manual testing after a frech DB reset run `yarn test:e2e --project="setup db"`

## Supabase

Set up the local database, for the first time use:

- `supabase start` (can take a long time)
- `supabase login`
- `supabase link`

To pull the latest migrations from the linked(=remote) db

> supabase db pull

To make your local db look like the migrations

> supabase db reset

To generate a migration file for the diff between you local db and what is defined in the migrations files

> supabase db diff --schema=public -f [migration name]

Export DB types

 > yarn sb:gentypes

To push db changes to prod

> supabase db push -- DON'T USE!!! (if you don't know what you are doing)

### Backup

To make a (manual) backup or restore the backup, see the supabase [docs](https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore)
