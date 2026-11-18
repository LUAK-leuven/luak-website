---
name: write-lint-rule
description: "Use when creating or editing a custom ESLint rule"
---

# Write Lint Rule

- Implement each rule in its own file in `eslint-rules/`; `eslint.config.mjs` only imports and enables it.
- TDD with ESLint's `RuleTester`: write valid/invalid cases (including `output` for fixes) before the implementation.
- Provide an autofix (`meta.fixable`) whenever the fix is safe and deterministic; omit it only when it can't be, and say why in the rule's docs/meta.
- Verify with the rule's tests and `yarn lint`; e2e/app suites are not needed.
