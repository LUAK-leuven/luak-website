---
name: review-code-quality
description: Use when verifying the code quality of changes (standards, structure, tests, architecture)
---

# Review code quality

Read `docs/ai-agent-architecture.md` if the change touches data access or business logic.

## Checks

- Standards: follows conventions, naming and patterns of neighbouring code (TypeScript, Nuxt 4, TailwindCSS/DaisyUI).
- Structure: small focused functions/components, no duplication, no dead or debug code, clear names.
- Tests: new/changed behaviour has tests that assert behaviour, not implementation.
- Architecture: business logic and non-trivial Supabase access live in Nitro; direct frontend Supabase calls only for simple, rule-free interactions.
- Deterministic: run the lint, typecheck and test scripts from `package.json`; report failures.

## Output

Findings with `file:line` and severity (blocker / suggestion), grouped as Standards, Structure, Tests, Architecture.
