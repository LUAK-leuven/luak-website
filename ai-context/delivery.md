## Every step must be deliverable

A plan's steps are implemented one at a time (see the `implement` skill), and **each step must leave the app in a shippable state** — it could go to production with no broken code, even if the feature isn't finished yet. A step is not "done" just because its own acceptance criteria pass; it is only done if nothing else in the app was broken by it.

This matters most when a step changes the **shape of something other files consume** (a composable's return value, a component's props/emits, a shared type, a util's signature). The step that changes the shape is responsible for keeping every consumer working — not the step (or person) that happens to notice later.

## Finding consumers

Before touching a file's public surface, find everything that uses it:

- Search the codebase for every import/usage of the file, composable, component, or type being changed.
- Do not stop at what the plan's acceptance criteria mention — a plan can miss an integration point (e.g. a composable refactor step that forgets the component that renders its state). That is expected and not a failure of planning by itself; it becomes a problem only if it goes unnoticed.

## When a step breaks a consumer the plan didn't mention

This can happen even with a good plan. When it does:

1. **Stop.** Do not silently patch the consumer as an undocumented side change, and do not move on to the next step with the breakage left in place.
2. **Report it** to the user: what broke, why (the step's shape change), and the minimal fix required to restore a working state.
3. **Update `plan.md`** to include that fix as part of the current step (adjust its acceptance criteria/notes) — the plan should end up accurately describing what shipping this step requires, for future readers.
4. **Ask the user** to approve the change to the plan before implementing it.
5. **Implement the fix** as part of the (now-updated) current step, then verify again.

Do not treat this as "implementation detail cleanup" to fold in quietly — the plan is the source of truth for what a step delivers, so it must reflect reality before the step is considered complete.

If the breakage wasn't caught by `yarn typecheck`, `yarn lint`, or `yarn test`, also see [ai-context/guardrail-gaps.md](./guardrail-gaps.md) — that gap needs closing too, independent of the plan/step process.
