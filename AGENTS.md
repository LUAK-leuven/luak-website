# AGENTS.md — luak-website

## Project Overview

**LUAK (Leuvense Universitaire Alpinisten Klub)** website.
Stack: **Nuxt 3** · **Vue 3** · **TypeScript** · **TailwindCSS + DaisyUI** · **Supabase** · **Vercel**

---

## Commands

```bash
# Install dependencies
yarn install

# Development server
yarn dev

# Production build
yarn build

# Lint (ESLint + Prettier check)
yarn lint

# Lint fix (ESLint --fix + Prettier --write)
yarn lintfix

# Supabase local dev
supabase start

# Reset local DB
supabase db reset

# Pull remote DB schema
supabase db pull

# Generate a migration from local schema diff
supabase db diff --schema=public -f <migration_name>

# Regenerate Supabase TypeScript types
yarn supabase gen types --lang typescript --local > types/database.types.ts

# Run e2e tests (slow)
yarn test:e2e
```

---

## Architecture

```
pages/          # File-based routing (Vue + TypeScript + Nuxt conventions)
components/     # Atomic, composable, and page-specific components
layouts/        # Site-wide layout wrappers (default, pageWithTitle, picture)
composables/    # Vue composables prefixed with `use`
utils/          # Pure utilities and singleton service classes
types/          # TypeScript types and branded IDs
middleware/     # Route guards (auth.global.ts, boardMemberGuard.ts, etc.)
content/        # Markdown content files (Nuxt Content v3)
yup_schemas/    # Shared yup validation schemas
supabase/       # DB migrations, seed, edge functions (Deno runtime)
```

Key data flows:
- **Auth & membership**: `composables/useLuakMember.ts` + `middleware/auth.global.ts`
- **Database access**: `utils/gearService.ts`, `utils/userService.ts` (singleton classes)
- **Global toasts**: `usePopup()` composable → consumed by `PopUpV2` in `layouts/default.vue`
- **Stripe payments**: `supabase/functions/_shared/stripe.ts` + runtime config payment links
- **Content**: `content.config.ts` defines collection schemas; use `ContentRenderer` in templates

---

## Code Style

### TypeScript
- TypeScript is **mandatory everywhere**, including `<script setup lang="ts">` in all SFCs.
- Use `import type { ... }` for type-only imports.
- Prefer named exports; use `import * as yup from 'yup'` only for namespace-style libraries.
- Use branded ID types (`EntityId<'user'>`, `UserId`, `RentalId`) for all primary keys.
- Cast Supabase row IDs: `data.id as UserId`.
- Use `Database['public']['Tables']['X']['Row']` for table row types, `Enums<'x'>` for DB enums.
- Utility types live in `utils/typeUtils.ts`: `Defined<T>`, `GetReturn<T>`, `Unwrap<T>`.
- Generic components use `<script setup lang="ts" generic="T">`.

### Vue SFCs
- Always use Composition API with `<script setup lang="ts">`.
- `<script setup>` and `<style>` contents are indented 2 spaces inside the tag (`vueIndentScriptAndStyle: true`).
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
- **Single quotes**, **semicolons**, **trailing commas** (all contexts).
- **2-space indentation**, no tabs.
- `bracketSameLine: true` — closing `>` of multiline HTML tags stays on the last attribute line.
- Vue HTML attribute order is enforced by `prettier-plugin-organize-attributes`.
- Run `yarn lintfix` to auto-fix all formatting.

### Naming Conventions
| Entity | Convention | Example |
|---|---|---|
| Vue component files | PascalCase | `ActivityItem.vue`, `NavBar/index.vue` |
| Composables | camelCase, `use` prefix | `useLuakMember.ts` |
| Utility files | camelCase | `gearService.ts`, `getLuakYear.ts` |
| TypeScript types | PascalCase | `UnsavedRental`, `RentalId` |
| Component props/emits | camelCase in TS, kebab-case in template | `isLoading` / `:is-loading` |
| DB columns | snake_case (from Supabase) | `created_at`, `is_active` |
| Pages | kebab-case directories, camelCase file names | `pages/board/rentals/[id].vue` |

### Supabase Query Pattern
```ts
const { data, error } = await useSupabaseClient<Database>()
  .from('TableName')
  .select('col1, col2, Related(col)')
  .eq('id', someId)
  .single();

if (error || !data) {
  console.error(error);
  return fallbackValue; // never throw; return safe default
}
```

### Service Classes
Services are singleton factory functions wrapping a class:
```ts
class GearService {
  private readonly supabase = useSupabaseClient<Database>();
  public async getAllItems() {
    return useAsyncData('key', async () => { /* ... */ }, { lazy: true });
  }
}
let instance: GearService | undefined;
export function gearService(): GearService {
  if (!instance) instance = new GearService();
  return instance;
}
```

### Error Handling
- Supabase errors: check `if (error || !data)`, log with `console.error`/`console.warn`, return a safe fallback — **do not throw**.
- Form errors: use `setFieldError('field', message)` via vee-validate.
- Global toasts: `usePopup().show('error' | 'success', message)`.
- Route errors: `createError({ statusCode: 404, statusMessage: '...' })` or `navigateTo('/login')` in middleware.

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
- Use **TailwindCSS + DaisyUI** classes for all UI. Active theme: `nord`.
- DaisyUI patterns: `btn btn-primary`, `card card-compact`, `badge badge-info`, `modal`, `loading loading-spinner`, `alert alert-success`.
- Custom animations defined in `tailwind.config.js` (e.g., `animate-bounceInput`).
- Global base styles and custom fonts in `assets/css/main.scss`.
- Do not write raw CSS when a Tailwind or DaisyUI utility exists.

---

## Integration Points

- **Supabase**: Auth, DB, Storage via `@nuxtjs/supabase`. Types in `types/database.types.ts` — **regenerate after any schema change**.
- **Stripe**: Payment links in Nuxt runtime config; webhook handler in `supabase/functions/stripe-webhook/`.
- **Nuxt Content**: Markdown-driven pages; schemas defined in `content.config.ts`.
- **Nuxt Studio**: Visual content editing interface for `content/` directory.
- **Edge Functions**: Deno runtime in `supabase/functions/`; VSCode Deno extension scoped to that path.

---

## Key Rules for AI Agents

1. Always regenerate `types/database.types.ts` after any Supabase schema change.
2. Use project composables and middleware for auth/membership logic — do not reinvent them.
3. Use `~/` path alias, never relative `../../` imports for project files.
4. Run `yarn lintfix` before committing to fix formatting automatically.
5. Keep the DaisyUI theme (`nord`) consistent; do not introduce inline styles or raw hex colors.
6. Do not add new dependencies without good reason — check if `@vueuse/core`, `dayjs`, or existing utils cover the need.
7. Content-driven features must define their collection in `content.config.ts`.
