---
name: implement-plan
description: Implement a feature or change from a written plan, following all luak-website code conventions
license: MIT
compatibility: opencode
metadata:
  audience: developers
  workflow: build
---

## What I do

Given a plan (a written description, a `plan.md` file, or a prior conversation), I implement the described changes in the luak-website codebase, strictly following all project conventions.

## Workflow

1. **Read the plan** — fully understand scope, affected files, and the expected outcome before writing any code.
2. **Explore first** — read existing related files (components, composables, services, pages, types) to understand patterns already in use. Never guess at structure.
3. **For each task** - one task at a time:
    1. **Implement incrementally** — make one logical change at a time.
    2. **Lint after all edits** — always run `yarn lintfix` at the end to auto-fix formatting.
    3. **Verify the build** — run `yarn build` and fix any TypeScript or Nuxt build errors before declaring done.
    4. **Verify the result** - run `yarn dev` and verify the result on http://localhost:3000.
    5. **Stop and ask for approval from the user** - IMPORTANT! 
    6. **Update todo** - mark each step complete before moving on.
    7. **Commit** - commit your changes.

## Hard rules

- TypeScript everywhere: `<script setup lang="ts">` in every SFC; `import type` for type-only imports.
- Use `~/` alias for all project-root imports — never relative `../../` paths.
- Use existing composables and middleware for auth/membership (`useLuakMember`, `auth.global.ts`) — do not reinvent them.
- Use existing service singletons (`gearService()`, `userService()`) for DB access; follow the singleton pattern when creating new ones.
- Form validation with vee-validate + yup; shared validators live in `utils/yup.ts`.
- UI must use TailwindCSS + DaisyUI (`nord` theme) — no inline styles, no raw hex colors.
- Do not add new npm dependencies without checking if `@vueuse/core`, `dayjs`, or an existing util already covers the need.
- Content-driven features must define their collection schema in `content.config.ts`.
- New Supabase migrations must be followed by type regeneration.
- Don't write unnecessary comments.

## Naming conventions (quick reference)

| Entity | Convention | Example |
|---|---|---|
| Vue SFC | PascalCase | `ActivityItem.vue` |
| Composable | camelCase + `use` prefix | `useLuakMember.ts` |
| Utility / service | camelCase | `gearService.ts` |
| TypeScript types | PascalCase | `UnsavedRental` |
| Pages | kebab-case dirs, camelCase file | `pages/board/rentals/[id].vue` |
| DB columns | snake_case | `created_at` |

## Code patterns to follow

### Supabase query
```ts
const { data, error } = await useSupabaseClient<Database>()
  .from('TableName')
  .select('col1, col2, Related(col)')
  .eq('id', someId)
  .single();

if (error || !data) {
  console.error(error);
  return fallbackValue;
}
```

### Service singleton
```ts
class FooService {
  private readonly supabase = useSupabaseClient<Database>();
  public async getAll() {
    return useAsyncData('foo-all', async () => { /* ... */ }, { lazy: true });
  }
}
let instance: FooService | undefined;
export function fooService(): FooService {
  if (!instance) instance = new FooService();
  return instance;
}
```

### Form with vee-validate + yup
```ts
const schema = yup.object({ field: yup.string().required() });
const { handleSubmit, isSubmitting, setFieldError } = useForm({
  validationSchema: toTypedSchema(schema),
});
const onSubmit = handleSubmit(async (values) => {
  // call service; on failure: setFieldError('field', message)
});
```

## When to use me

Load this skill when you are asked to implement a concrete plan in the luak-website codebase.
