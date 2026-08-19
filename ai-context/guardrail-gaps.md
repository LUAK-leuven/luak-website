## Close guardrail gaps whenever you find one

This applies any time a bug is found and fixed — not only while implementing a plan step. It applies to bugs reported by the user, bugs found while exploring the codebase, regressions noticed during manual testing, anything.

`yarn typecheck`, `yarn lint`, and `yarn test` are the guardrails this codebase relies on to catch mistakes automatically. Whenever you fix a bug, ask: **would `yarn typecheck && yarn lint && yarn test` have caught this before it was fixed?**

- **If yes** (a guardrail did catch it, or would have caught it had it been run) — nothing further to do, the safety net already exists.
- **If no** (the bug could have shipped with all three green) — that is a gap in the guardrails, not just a one-off mistake. It will happen again, to someone else (human or agent), unless the gap is closed.

## Closing the gap

1. **Diagnose why the guardrails missed it.** Common causes in this codebase:
   - A type was widened (`any`/`unknown`), cast away, or the shape change was compatible enough that TypeScript didn't flag the misuse (e.g. an object still had the right keys but the wrong semantics, or a template expression wasn't type-checked).
   - No test exercised the code path or integration point at all (e.g. a composable's unit tests never rendered the component that consumes it; an edge case was never tried).
   - The lint ruleset has no rule that would flag the pattern (e.g. an unused export, a stale prop, a forbidden pattern).
2. **Add the missing safety net** so the same class of bug is caught automatically next time:
   - A test (unit, component, or e2e) that exercises the path that broke — this is usually the right fix and should be preferred over the alternatives below.
   - A stricter type (remove a cast, narrow a type, avoid `any`/`unknown`) if the bug was a symptom of an overly loose type.
   - A lint rule addition/adjustment, only if the pattern is generic enough to warrant one — avoid adding a rule for a single call site.
3. **Report the gap and the safety net added**, in addition to reporting the bug fix itself. State explicitly what was previously uncaught and what now catches it — do not just describe the fix.
4. If closing the gap is non-trivial (broad refactor, new tooling/dependency, a lint rule that would affect many other files), stop and ask the user how to proceed rather than skipping it silently.

Do not fix a bug and move on without going through this check — a bug fixed without closing the guardrail gap is likely to resurface.
