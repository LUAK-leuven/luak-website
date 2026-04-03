# LUAK website

The techstack used for this project is:

- nuxt 3
- nuxt content v3 + nuxt studio (visual content editing)
- tailwindcss + daisyui

- supabase for the backend
- vercel for deployment

- Sentry?
- Stripe for payments

## Setup

Install stuff
1. install [Docker](https://docs.docker.com/desktop/setup/install/) (or podman)
2. install Node 20.x.x (using asdf: `asdf install nodejs 20.20.2`)
3. install yarn: `npm install --global yarn@1.22.22`
4. install packages: `yarn install`
5. install browsers for the e2e tests: `yarn playwright install`

next set the right env variables to connect with supabase. check `.env.example` and the [Supabase Docs](https://supabase.com/docs/guides/getting-started)

### e2e-tests

Firs you need to install playwright: `yarn playwright install`

## Nuxt Studio

Visual content editing is available through Nuxt Studio.

**Quick start (dev mode):**
- Run `yarn dev`
- The local server should be running on http://localhost:3000

To run against the production database: `yarn dev --dotenv .env.production`

## Test users

Some test users are created when setting up the database (when running `yarn supabase db reset` the db is populated with [seed.sql](supabase/seed.sql)):

- non_member@test.com
- unpaid_membership@test.com
- paid_last_year@test.com
- paid_this_year@test.com
- board_member@test.com

All the users have the same password: 123456789

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

Esport DB types

 > yarn supabase gen types --lang typescript --local > types/database.types.ts

To push db changes to prod

> supabase db push -- DON'T USE!!! (if you don't know what you are doing)

### Backup

To make a (manual) backup or restore the backup, see the supabase [docs](https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore)
