---
name: write-plan
description: Create a clear, detailed implementation plan for a feature or task. Use this skill when the user asks to "create a plan", "write a plan", or "plan out" something. The output is a plan.md in the planning/<feature-name>/ folder. Do NOT use this skill for research or exploring trade-offs between approaches — use the write-research-doc skill for that.
---

## What this skill does

Guides a structured planning session that ends with a `planning/<feature-name>/plan.md` file. The plan captures every implementation step at the smallest useful granularity, all design decisions resolved upfront, and a TDD approach wherever applicable — so the developer only needs to think about code, not design.

---

## Core principles

- **No implementation details**: the plan describes *what* to build and *what behaviour is expected*, not *how the code should look*. No code snippets, no class designs, no specific function signatures.
- **Smallest possible steps**: each step should be completable in one focused sitting. If a step feels large, break it down further.
- **TDD first**: wherever behaviour can be verified with a test, the test step comes before the implementation step.
- **All design decisions resolved**: the developer must be able to execute every step without making a design choice. Ambiguities are resolved by asking the user before writing the plan.
- **Agile increments**: steps are ordered so that each one produces a runnable, testable increment. Avoid big-bang steps.
- **Every step is deliverable**: a step must leave the app in a shippable state — no broken consumers, even ones the plan doesn't explicitly call out elsewhere. See [ai-context/delivery.md](../../../ai-context/delivery.md).
- **Incremental design**: infrastructure (helpers, base classes, shared utilities) is introduced at the step where it is first actually needed — never created upfront in isolation. Each step builds only what the current increment requires; later steps extend it as needed.

---

## Workflow

### Step 1 — Understand the feature

Before writing anything, explore the codebase to understand:

- Which existing files, components, composables, pages, or services are relevant.
- What patterns are already established that the new feature must follow.
- Any constraints (auth, permissions, DB schema, existing types) that affect the feature.
- For any file, composable, component, or type whose public shape the plan will change, every place that consumes it — these consumers must be accounted for in the step that changes the shape (see [ai-context/delivery.md](../../../ai-context/delivery.md)).

Use the `explore` subagent for broad searches to avoid consuming context with raw listings. Read actual file contents — do not rely on filenames alone.

### Step 2 — Identify open design questions

List every decision that must be made before implementation can begin. These are questions where the answer affects the plan's steps — not implementation details the developer should decide.

Examples of questions that belong here:
- Should this be accessible to all members or only board members?
- Should this replace the existing flow or exist alongside it?
- Should failures surface as a toast or an inline error?
- Does this need an optimistic UI update?

Examples of questions that do NOT belong here (developer decides):
- Which variable name to use
- Whether to extract a helper function
- Internal component structure

### Step 3 — Ask the user

Use the `question` tool to resolve all open design questions identified in step 2. Batch into a single call where possible. Offer a recommended option where you have a clear technical preference based on the codebase patterns.

Do not proceed to writing the plan until all questions are answered.

### Step 4 — Iterate

If the user's answers raise new questions, ask them. Repeat until all design decisions are resolved.

### Step 5 — Write the plan

Write `planning/<feature-name>/plan.md` using the structure below.

#### Document structure

```
# Plan: <Feature Name>

## Overview
One paragraph describing what the feature does and the value it delivers. No implementation details.

## Scope
- What is included in this plan.
- What is explicitly out of scope (defer to future work).

## Design Decisions
A numbered list of every design decision resolved during planning.
Each entry: the question and the agreed answer.

## Prerequisites
Any migrations, config changes, or external setup that must exist before the first step.
List these as actionable items, not steps (they may already be done).

## Steps

### Step N — <Short title>
**Goal**: one sentence describing what this step achieves.
**TDD**: (only if applicable) what test to write first and what it should assert, without specifying the test's implementation.
**Acceptance criteria**: bullet list of observable behaviours that confirm the step is complete.
**Notes**: (optional) any constraint, edge case, or codebase-specific context the developer needs.

[repeat for each step]
```

#### Step writing rules

- Title: verb phrase ("Add X", "Wire Y to Z", "Guard route with X").
- Goal: one sentence, outcome-focused.
- TDD entries exist whenever a unit or integration test can verify the behaviour before or alongside writing the implementation.
- Acceptance criteria are written from the user's or system's perspective ("the user sees…", "the API returns…", "the DB row is created…").
- Steps are ordered smallest-first: types and schema before logic, logic before UI, UI before integration.
- Each step must be independently completable — no step should require finishing a later step to work.
- Each step must be deliverable on its own: if it changes a composable's/component's/type's public shape, its acceptance criteria must include updating every known consumer of that shape, not just the new behaviour.
- Infrastructure (helpers, base classes, shared utilities) is introduced at the step where it is first needed, not upfront. A step that creates a helper must also be the step that first uses it — a helper created in step N with no consumer until step N+3 is a sign the steps need merging or reordering.

### Step 6 — Incorporate user feedback

If the user reviews the plan and requests changes:

- Update the affected steps directly.
- If a decision changes, update the Design Decisions section.
- If new steps are needed, insert them at the correct position and renumber.
- Do not leave comments or annotations in the final document.

---

## What NOT to do

- Do not write any implementation code or modify any source files.
- Do not include code snippets, pseudocode, or specific API shapes in the plan.
- Do not leave design decisions open — all ambiguities must be resolved before the plan is written.
- Do not create large monolithic steps — if in doubt, break it down.
- Do not create infrastructure (helpers, base classes, page objects, shared utilities) in a step that does not also use it — introduce them at the point of first use.
- Do not skip TDD entries to save space — if behaviour is testable, include the TDD step.
- Do not summarize or repeat what you already wrote in the plan.
