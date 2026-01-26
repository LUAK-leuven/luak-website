# LUAK website

The techstack used for this project is:

- nuxt 3
- nuxt content + **nuxt studio** (visual content editing)
- tailwindcss + daisyui

- supabase for the backend
- vercel for deployment

## Setup

The easiest way to get started is using vscode with devcontainers. a devcontainer is defined including all the necessarry dependencies.

1. install Docker
2. install Vscode
3. Open this github repo in a dev-container

---OR---

3. use github codespaces

next set the right env variables to connect with supabase. check `.env.example` and the [Supabase Docs](https://supabase.com/docs/guides/getting-started)

# Nuxt Studio

Visual content editing is available through Nuxt Studio. See [NUXT_STUDIO_SETUP.md](./NUXT_STUDIO_SETUP.md) for complete setup instructions.

**Quick start (dev mode):**
- Run `yarn dev`
- Look for the floating Studio button in the bottom-left corner
- Click to edit content visually

**Production setup:** See the full setup guide for configuring GitHub OAuth and enabling content editing on your live site.

# Test users

Some test users are created when setting up the database (when running `yarn supabase db reset` the db is populated with [seed.sql](supabase/seed.sql)):

- non_member@test.com
- unpaid_membership@test.com
- paid_last_year@test.com
- paid_this_year@test.com
- board_member@test.com

All the users have the same password: 123456789

# Supabase

- supabase start
- supabase login
- supabase link

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
