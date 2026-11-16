---
name: duplication-of-code
description: Use when refactoring/identifying code duplication to improve maintainability and reduce errors.
---

Read (https://refactoring.guru/smells/duplicate-code) with `webfetch`.

**Duplicate Code** means a duplicated *concept*, not just similar text. For each extraction, name the concept and its source of truth (e.g. framework-generated types, schema), and model the abstraction on that concept, not on the union of the fragments.

- Merge only code that changes for the same reason. Fragments feeding different contracts (e.g. different DTOs) are not duplicates as a whole; extract the smallest unit that is one concept (e.g. one column-to-domain conversion), not their overlap.
- Red flags for coincidental similarity: names like `Shared`/`Common`, a `Pick<>` of an arbitrary field subset, spread plus per-caller extras.
- If the planned treatment doesn't fit the code, return a `PLAN_PROPOSAL` instead of improvising another abstraction (small implementation details are fine).

Small differences between duplicates are drift to resolve, not variants to keep as props/slots. List every difference with a proposed unified choice for the user to approve. "Keep behavior identical" does not cover these accidental differences.