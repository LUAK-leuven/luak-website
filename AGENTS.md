# AGENTS.md — luak-website

## Project Overview

The LUAK website is a website for a climbing club. It is mostly content based. The club regularely organizes activities, which are shown on the activities page (and news page).
The website is also used by the board to keep track of rented gear (LUAK has a lot of climbing gear and topos that can be rented by its members). This is all part of the board section.

Make sure to read [ai-context](./ai-context/index.md) so that you can load the correct context.

---

## Code Style

### TypeScript

- TypeScript is **mandatory everywhere**, including `<script setup lang="ts">` in all SFCs.
- Never use `any` type and avoid `unknown`, use the correct types at all times.
- **Avoid type casting**.
- Run `yarn lint` to verify you're not introducing errors.
- Use `import type { ... }` for type-only imports.
- Prefer named exports; use `import * as yup from 'yup'` only for namespace-style libraries.
- Use branded ID types (`EntityId<'user'>`, `UserId`, `RentalId`) for all primary keys.
- Cast Supabase row IDs: `data.id as UserId`.
- Do not duplicate database types, use `Database['public']['Tables']['X']['Row']` for table row types, `Enums<'x'>` for DB enums.
- Utility types live in `utils/typeUtils.ts`: `Defined<T>`, `GetReturn<T>`, `Unwrap<T>`.
- Generic components use `<script setup lang="ts" generic="T">`.

### Vue SFCs

- Always use Composition API with `<script setup lang="ts">`.
- Use `defineProps<{ ... }>()` (generic typed), `withDefaults()` when needed.
- Use typed emits: `defineEmits<{ close: []; onSelect: [value: T] }>()`.
- Use `defineModel<T>()` for two-way binding.
- Nuxt auto-imports are available (`ref`, `computed`, `useAsyncData`, `useSupabaseClient`, `definePageMeta`, etc.) — no explicit import needed.
- Use `NuxtLink` instead of `<a>`, `NuxtImg` instead of `<img>`, `ContentRenderer` for Markdown.

### Imports & Aliases

- Use `~/` alias for all project-root imports (e.g., `~/types/database.types`, `~/utils/yup`).
- Type-only imports must use `import type`.
- Nuxt auto-imported APIs do not need explicit imports.

### Formatting (Prettier)

- Run `yarn lintfix` to auto-fix all formatting.

### Naming Conventions

| Entity                | Convention                                   | Example                                |
|-----------------------|----------------------------------------------|----------------------------------------|
| Vue component files   | PascalCase                                   | `ActivityItem.vue`, `NavBar/index.vue` |
| Composables           | camelCase, `use` prefix                      | `useLuakMember.ts`                     |
| Utility files         | camelCase                                    | `gearService.ts`, `getLuakYear.ts`     |
| TypeScript types      | PascalCase                                   | `UnsavedRental`, `RentalId`            |
| Component props/emits | camelCase in TS, kebab-case in template      | `isLoading` / `:is-loading`            |
| DB columns            | snake_case (from Supabase)                   | `created_at`, `is_active`              |
| Pages                 | kebab-case directories                       | `pages/board/rentals/[id].vue`         |

### Error Handling

- To show an error/success to the user, use `useToast().show('error' | 'success', message)`.
- If the error is an error that should be thrown (e.g., a 404 page), use `throw createError({ statusCode: 404, statusMessage: '...' })`.
- Form errors: use `setFieldError('field', message)` via vee-validate.

### Form Validation (vee-validate + yup)

```ts
const schema = yup.object({ field: yup.string().required() });
const { handleSubmit, isSubmitting, setFieldError } = useForm({
  validationSchema: toTypedSchema(schema),
});
const onSubmit = handleSubmit(async (values) => {
  // call service, setFieldError on failure
});
```

Shared yup validators (phone, password) live in `utils/yup.ts`.

### UI / Styling

- Reuse existing components (such as the `Button` iso the native html `button`) and composables for UI.
- Use **TailwindCSS + DaisyUI** classes for all UI. Active theme: `nord`.
- DaisyUI patterns: `btn btn-primary`, `card card-compact`, `badge badge-info`, `modal`, `loading loading-spinner`,
  `alert alert-success`.
- Global base styles and custom fonts in `assets/css/main.scss`.
- Do not write raw CSS.

---

## Integration Points

- **Supabase**: Auth, DB, Storage via `@nuxtjs/supabase`. Types in `types/database.types.ts` — **regenerate after any
  schema change**.
- **Stripe**: Payment links in Nuxt runtime config; webhook handler in `supabase/functions/stripe-webhook/`.
- **Nuxt Content**: Markdown-driven pages; schemas defined in `content.config.ts`.
- **Nuxt Studio**: Visual content editing interface for `content/` directory.
- **Edge Functions**: Deno runtime in `supabase/functions/`; VSCode Deno extension scoped to that path.

---

## Key Rules for AI Agents

1. Use project composables and middleware for auth/membership logic — do not reinvent them.
2. Use `~/` path alias, never relative `../../` imports for project files.
3. Run `yarn lint` and `yarn test` before committing to verify you didn't introduce errors.
4. Keep the DaisyUI theme (`nord`) consistent; do not introduce inline styles or raw hex colors.
5. Do not add new dependencies without good reason — check if `@vueuse/core`, `dayjs`, or existing utils cover the need.
