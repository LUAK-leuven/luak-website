# Copilot Instructions for LUAK Website

## Project Overview
- **Stack:** Nuxt 3, Nuxt Content, Nuxt Studio, TailwindCSS + DaisyUI, Supabase (backend), Vercel (deployment)
- **Purpose:** Website for LUAK (Leuvense Universitaire Alpinisten Klub) with news, activities, stories, membership, and board management.
- **Content Editing:** Nuxt Studio for visual content editing (local dev + production)

## Architecture & Data Flow
- **Frontend:**
  - Pages in `pages/` (Vue, TypeScript, Nuxt conventions)
  - Components in `components/` (atomic, composable, and page-specific)
  - Layouts in `layouts/` (site-wide wrappers, e.g., `default.vue`)
  - Content in `content/` (Markdown, structured via `content.config.ts`)
- **Backend:**
  - Supabase for authentication, database, and storage
  - Database types in `types/database.types.ts` (generated)
  - Supabase edge functions in `supabase/functions/`
  - Stripe integration in `supabase/functions/_shared/stripe.ts`

## Developer Workflows
- **Install:** `yarn install`
- **Dev server:** `yarn dev`
- **Supabase local:** `supabase start`
- **DB workflows:**
  - Pull remote schema: `supabase db pull`
  - Reset local DB: `supabase db reset`
  - Generate migration: `supabase db diff --schema=public -f [migration name]`
  - Generate types: `yarn supabase gen types --lang typescript --local > types/database.types.ts`
- **Test users:** See [README.md](../README.md) for credentials and setup

## Project Conventions
- **TypeScript everywhere** (including Vue `<script setup lang="ts">`)
- **Content collections** defined in `content.config.ts` (activities, news, stories, info, pages)
- **Supabase types** must be kept in sync with DB schema (see DB workflows)
- **Board/member logic:**
  - Board membership: `BoardMembers` table, checked via `middleware/boardMemberGuard.ts`
  - Membership status: `Memberships` table, logic in `composables/useLuakMember.ts`
- **UI:**
  - TailwindCSS + DaisyUI for styling
  - Use `FullPageCard`, `PopUpV2`, and other shared components for layout/UX
- **Content rendering:**
  - Use `ContentRenderer` for Markdown content
  - Content-driven routes for news, activities, stories

## Integration Points
- **Supabase:**
  - Auth, DB, and storage via `@nuxtjs/supabase` module
  - Edge functions in `supabase/functions/`
- **Stripe:**
  - Payment links in runtime config and `.env.example`
  - Stripe API usage in `supabase/functions/_shared/stripe.ts`
- **Sentry:**
  - Error tracking via `@sentry/nuxt` (see `sentry.client.config.ts`)

## Examples & References
- **Membership logic:** `composables/useLuakMember.ts`
- **Board guard:** `middleware/boardMemberGuard.ts`
- **Content schema:** `content.config.ts`
- **DB types:** `types/database.types.ts`
- **Supabase config:** `supabase/config.toml`, `.env.example`
- **README:** [../README.md](../README.md) for setup, workflows, and test users

---
**For AI agents:**
- Always keep DB types in sync after schema changes
- Use project-specific composables and middleware for auth/membership logic
- Follow Nuxt and Tailwind conventions for structure and style
- Reference content schemas for Markdown-driven features
- When in doubt, check the README and referenced files above
