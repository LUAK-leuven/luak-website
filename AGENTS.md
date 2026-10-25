## Project Overview

The LUAK website is a website for a climbing club. It is mostly content based, which regularly gets updated (by non-technical users).
The website is also used by the board to keep track of rented gear.

## Tech stack

- **Framework**: Nuxt 4, Typescript
- **Styling**: TailwindCSS, DaisyUI
- **Backend**: Supabase
- **Devtools**: yarn, ESLint, Prettier

## Key Rules for AI Agents

- Reply with concise answers. Never reply with more than 3000 characters.
- Read [`docs/ai-agent-architecture.md`](docs/ai-agent-architecture.md) before changing data access or business logic.
- Keep business logic and non-trivial Supabase access in Nitro; use direct frontend Supabase calls only for explicitly simple, business-rule-free interactions.
- Shell command style:
  - One simple command per bash call. Avoid chaining multiple commands together or inline scripts.
  - Avoid python or bash scripts for file manipulation; use Read/Grep/Glob/Edit/Write tools instead.
  - For complex **and recurring** file manipulations, you may use a python script committed to the repository, avoid ad-hoc inline scripts.
  - Use `workdir` instead of `cd ... &&`; use Read/Grep/Glob/Edit/Write instead of `cat`/`grep`/`find`/`sed`/`echo`.
  - Run independent commands as parallel tool calls, dependent ones are sequential calls.
  - Prefer tool flags over shell filtering; read long output from the saved file.
