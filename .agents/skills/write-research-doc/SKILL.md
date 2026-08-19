---
name: write-research-doc
description: Explore a codebase problem area, present options with trade-offs, ask design questions, and produce a finalized research-*.md in the planning/ folder. Do NOT use this skill when the user asks to "create a plan", "write a plan", or "plan out" something — planning and research are distinct tasks.
---

## What this skill does

Guides a structured research session that ends with a `planning/<topic>/research.md` file. The file captures a thorough analysis of a problem, 2–3 concrete options, a recommendation, and all design decisions resolved through questions to the user.

---

## Workflow

### Step 1 — Understand the problem area

Before writing anything, do a thorough codebase exploration:

- Find every file directly related to the problem (components, composables, pages, utils, types).
- Read the actual file contents — do not rely on filenames alone.
- Identify all call sites and usage contexts, not just the definition.
- Use the `explore` subagent for broad searches to avoid consuming context with raw file listings.

The goal is to understand both **what exists** and **why it exists in its current form**.

### Step 2 — Identify and document usage contexts

Group the existing code into distinct usage contexts. Each context should describe:

- Where it appears in the codebase (files + rough line numbers)
- What problem it is solving
- What constraints it operates under

This section becomes the "Current Usage Contexts" section of the document and grounds all subsequent analysis in concrete reality rather than abstractions.

### Step 3 — Identify the core tension

Before listing options, name the underlying trade-off explicitly. This is usually a two-column comparison table (e.g. approach A vs approach B across dimensions like: verbosity, type safety, coupling, testability, composability). This table makes it immediately clear why a single obvious solution does not already exist.

### Step 4 — Draft 2–3 options

Each option must:

- Have a short descriptive title (not just "Option 1")
- Include a brief structural sketch (pseudocode or component tree is enough — no full implementation)
- List concrete **pros** and **cons** grounded in the actual codebase, not generic platitudes
- Be genuinely distinct — if two options collapse to the same approach, merge them

Aim for 2–3 options. More than three dilutes focus.

### Step 5 — Ask clarifying questions before recommending

Before writing the recommendation or resolving open questions, use the `question` tool to ask the user about:

- Design preferences that have no objectively correct answer (e.g. naming conventions, preferred abstraction level)
- Trade-offs where the user's context matters (e.g. how much migration churn is acceptable)
- Anything ambiguous about the scope (e.g. should related bugs be fixed as part of this effort)

Do not ask about things that have a clear technical answer — those belong in the recommendation reasoning.

Batch questions into a single `question` tool call where possible. Offer a "Recommended" option where you have a technical preference, but frame it honestly.

### Step 6 - Iterate

If the user replies with questions, answer them. Ask more questions if you think it is needed. Especially if they have an impact on the result or other questions.
If all questions are clearly answered continue.

### Step 7 — Write the initial document

Write `planning/<topic>/research.md` with:

1. **Problem Statement** — one paragraph, one table
2. **Current Usage Contexts** — one subsection per distinct context with file references
3. **The Core Tension** — the comparison table from step 3
4. **Options** — one subsection per option with sketch, pros, cons
5. **Recommendation** — which option and the concrete reasoning (reference the specific contexts from step 2)
6. **Open Questions** — anything requiring a decision before implementation can begin; number them Q1, Q2, …

Use the questions asked in step 5 to pre-populate any answers you already have. Leave the rest as open questions.

### Step 7 — Incorporate user feedback

After the user reviews the document and adds inline comments (typically `@` prefixed annotations), re-read the file and update it:

- Convert answered open questions into a **Decisions** section (replace the Open Questions section entirely once all are resolved).
- Strike through or remove ruled-out options with a one-sentence explanation of why.
- Update the recommendation if a user answer changes the calculus.
- Remove all `@` comment annotations — they are working notes, not permanent content.

Do not implement anything during this skill. The output is the research document only.

---

## Document conventions

- File name: `planning/<topic>/research.md`
- Headings: `##` for top-level sections, `###` for subsections
- Code sketches: fenced blocks with language tag; keep them short (5–15 lines) — enough to illustrate the API shape, not a full implementation
- File references: use `path/to/file.vue` (relative from project root), add line numbers where relevant (`lines 53–59`)
- Tables: use markdown pipe tables; align columns consistently
- Tone: direct and factual; no filler phrases; recommendations include explicit reasoning tied to the codebase, not general best practices

---

## What NOT to do

- Do not invoke this skill when the user asks to "create a plan", "write a plan", or "plan out" a feature — planning and research are distinct tasks; use the TodoWrite tool for planning instead.
- Do not write any implementation code or modify any source files.
- Do not create a plan or implementation steps.
- Do not resolve design questions unilaterally — ask the user.
- Do not leave `@` annotations in the final document.
