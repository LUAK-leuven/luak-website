# LUAK website

The techstack used for this project is:

- nuxt 3
- nuxt content
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

 > yarn supabase gen types typescript --local > types/database.types.ts

To push db changes to prod

> supabase db push -- DON'T USE!!! (if you don't know what you are doing)
