---
name: write-tests
description: "Use when writing or editing tests"
---

# Write Tests

- Assert literal expected values; never write tautological tests.
- Import test utils via the `#test` alias (an alias for `~~/test` and `~~/test/testUtils`), not relative paths.
- Tautology example to avoid: expecting `parse(x)` toEqual `x`, when both are derived from the same variable.
- Cover minimal (empty optionals), full (all optionals set), and failing (invalid or unknown input) cases.
- Test project logic, not libraries: no tests that only check zod (or other library) accepts valid/rejects invalid input for plain `.brand()` / `string().nonempty().brand()` factories or trivially composed schemas. Test custom logic and schema composition instead: mappings/conversions (e.g. DB 0 → 'infinite', empty → undefined), form validation messages, domain rules.
- Choose the test level by the layer whose behaviour you test, before writing it (also when proposing a fix):
  - unit: pure/domain logic and mapping;
  - integration (`test/integration/**/*.spec.ts`, local Supabase via `yarn sb:start`, real seeded rows): every endpoint and anything touching Supabase (queries, joins, filters, RLS, RPCs, SQL);
  - e2e: user workflows.
- Never mock or stub Supabase, at any level.
- Bug fix: write the failing test first at the lowest level that reproduces the bug in its real layer.
- Prefer random values from builders in `test/testUtils/builders` (for example, `aRandomRentalId` imported from `#test/builders/ids`) over hardcoded values unless the value is the point of the test.
