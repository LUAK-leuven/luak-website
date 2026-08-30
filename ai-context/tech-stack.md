**IMPORTANT**: See [package.json](../package.json) for the versions

- `vue`
- `typescript`
- `nuxt`
- `tailwindcss` + `daisyui`

- `yup` for runtime object validation
- `vee-validate` for forms

## Integration Points

- **Supabase**: Auth, DB, Storage via `@nuxtjs/supabase`. Types in `shared/types/database.types.ts` — **regenerate after any
  schema change**.
- **Stripe**: Payment links in Nuxt runtime config; webhook handler in `supabase/functions/stripe-webhook/`.
- **Nuxt Content**: Markdown-driven pages; schemas defined in `content.config.ts`.
- **Nuxt Studio**: Visual content editing interface for `content/` directory.
- **Edge Functions**: Deno runtime in `supabase/functions/`; VSCode Deno extension scoped to that path.
- **Vercel**: For deployment
