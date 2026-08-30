# AGENTS.md — luak-website

## Project Overview

The LUAK website is a website for a climbing club. It is mostly content based. The club regularly organizes activities, which are shown on the activities page (and news page).
The website is also used by the board to keep track of rented gear (LUAK has a lot of climbing gear and topos that can be rented by its members). This is all part of the board section.

Make sure to read [ai-context](./ai-context/index.md) so that you can load the correct context.

## Tech stack

- **Framework**: Nuxt 4, Typescript
- **Styling**: TailwindCSS, DaisyUI
- **Backend**: Supabase
- **Devtools**: ESLint, Prettier

More details can be found in [tech stack](./ai-context/tech-stack.md).

---

## Code Style

Before writing or editing any code, read [ai-context/code-style.md](./ai-context/code-style.md) for coding conventions.

---

## Key Rules for AI Agents

- Resolving open design questions is not authorization to implement. After a diagnostic or design discussion where the user answered questions (e.g. via the `question` tool), do not proceed to file edits, `todowrite`, or build/test-running steps for the underlying change. For non-trivial or multi-step changes, use the `write-plan` skill to produce a `planning/<feature>/plan.md` for review; otherwise explicitly ask "Should I proceed with implementation?" and wait for confirmation.
- Use project composables and middleware for auth/membership logic — do not reinvent them.
- Use path alias, never relative `../../` imports for project files.
- Run `yarn lint` and `yarn test` before committing to verify you didn't introduce errors.
- Keep the DaisyUI theme (`nord`) consistent; do not introduce inline styles or raw hex colors.
- Do not add new dependencies without good reason — check if `@vueuse/core`, `dayjs`, or existing utils cover the need.
- Whenever you fix a bug that `yarn typecheck`, `yarn lint`, and `yarn test` all would have missed, close that guardrail gap (add a test, stricter type, or lint rule) — see [ai-context/guardrail-gaps.md](./ai-context/guardrail-gaps.md). This applies to any bug fix, not just plan-step work.
