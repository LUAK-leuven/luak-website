---
name: duplication-of-code
description: Use when refactoring/identifying code duplication to improve maintainability and reduce errors.
---

Read (https://refactoring.guru/smells/duplicate-code) with `webfetch`.

**Duplicate Code** means a duplicated *concept*, not just similar text. For each extraction, name the concept and its source of truth (e.g. framework-generated types, schema), and models the abstraction on that concept, not on the union of the fragments.

Small differences between duplicates are drift to resolve, not variants to keep as props/slots. Lists every difference with a proposed unified choice for the user to approve. "Keep behavior identical" does not cover these accidental differences.