## Project Overview

The LUAK website is a website for a climbing club. It is mostly content based, which regularly gets updated (by non-technical users).
The website is also used by the board to keep track of rented gear.

## Tech stack

- **Framework**: Nuxt 4, Typescript
- **Styling**: TailwindCSS, DaisyUI
- **Backend**: Supabase
- **Devtools**: ESLint, Prettier

## Key Rules for AI Agents

- Reply with concise answers. Never reply with more than 3000 characters.
- Read [`docs/ai-agent-architecture.md`](docs/ai-agent-architecture.md) before changing data access or business logic.
- Keep business logic and non-trivial Supabase access in Nitro; use direct frontend Supabase calls only for explicitly simple, business-rule-free interactions.
