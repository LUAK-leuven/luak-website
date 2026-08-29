# Code Style

Read this before writing or editing any code (TypeScript, Vue SFCs, styling).

## TypeScript

- TypeScript is **mandatory everywhere**, including `<script setup lang="ts">` in all SFCs.
- Never use `any` type and avoid `unknown`, use the correct types at all times.
- **Avoid type casting**.
- Run `yarn typecheck` and `yarn lint` to verify you're not introducing errors.
- Use `import type { ... }` for type-only imports.
- Use branded ID types (`EntityId<'user'>`, `UserId`, `RentalId`) for all primary keys.
- Cast Supabase row IDs: `data.id as UserId`.
- Utility types live in `app/utils/typeUtils.ts`: `Defined<T>`, `GetReturn<T>`, `Unwrap<T>`.
- Generic components use `<script setup lang="ts" generic="T">`.

## Vue SFCs

- Always use Composition API with `<script setup lang="ts">`.
- Use `defineProps<{ ... }>()` (generic typed), `withDefaults()` when needed.
- Use typed emits: `defineEmits<{ close: []; onSelect: [value: T] }>()`.
- Use `defineModel<T>()` for two-way binding.
- Nuxt auto-imports are available (`ref`, `computed`, `useAsyncData`, `useSupabaseClient`, `definePageMeta`, etc.) — no explicit import needed.
- Use `NuxtLink` instead of `<a>`, `NuxtImg` instead of `<img>`, `ContentRenderer` for Markdown.

## Imports & Aliases

- Prefer named aliases over absolute paths (e.g., `#server/gearService` instead of `~~/server/gearService`).
- Prefer absolute imports over relative imports for project files (e.g., `~/utils/yup` instead of `../../utils/yup`).
- Nuxt aliases: `~/` refers to `app/`, and `~~/` refers to the project root.
- Type-only imports must use `import type`.
- Nuxt auto-imported APIs do not need explicit imports.

## Formatting (Prettier)

- Run `yarn lintfix` to auto-fix all formatting.

## Naming Conventions

| Entity                | Convention                                   | Example                                |
|-----------------------|----------------------------------------------|----------------------------------------|
| Vue component files   | PascalCase                                   | `ActivityItem.vue`, `NavBar/index.vue` |
| Composables           | camelCase, `use` prefix                      | `useLuakMember.ts`                     |
| Utility files         | camelCase                                    | `gearService.ts`, `getLuakYear.ts`     |
| TypeScript types      | PascalCase                                   | `UnsavedRental`, `RentalId`            |
| Component props/emits | camelCase in TS, kebab-case in template      | `isLoading` / `:is-loading`            |
| DB columns            | snake_case (from Supabase)                   | `created_at`, `is_active`              |
| Pages                 | kebab-case directories                       | `pages/board/rentals/[id].vue`         |

## Error Handling

- To show an error/success to the user, use `useToast().show('error' | 'success', message)`.
- If the error is an error that should be thrown (e.g., a 404 page), use `throw createError({ statusCode: 404, statusMessage: '...' })`.
- Form errors: use `setFieldError('field', message)` via vee-validate.

## UI / Styling

- Reuse existing components (such as the `Button` iso the native html `button`) and composables for UI.
- Use **TailwindCSS + DaisyUI** classes for all UI. Active theme: `nord`.
- DaisyUI patterns: `btn btn-primary`, `card card-compact`, `badge badge-info`, `modal`, `loading loading-spinner`,
  `alert alert-success`.
- Global base styles and custom fonts in `app/assets/css/main.scss`.
- Do not write raw CSS.
