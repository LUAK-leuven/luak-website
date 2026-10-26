---
name: write-tests
description: "Use when writing or editing tests"
---

# Write Tests

- Assert literal expected values; never write tautological tests.
- Import test utils via the `#test` alias (an alias for `~~/test` and `~~/test/testUtils`), not relative paths.
- Tautology example to avoid: expecting `parse(x)` toEqual `x`, when both are derived from the same variable.
- Cover minimal (empty optionals), full (all optionals set), and failing (invalid or unknown input) cases.
- Prefer random values from builders in `test/testUtils/builders` (for example, `aRandomRentalId` imported from `#test/builders/ids`) over hardcoded values unless the value is the point of the test.
