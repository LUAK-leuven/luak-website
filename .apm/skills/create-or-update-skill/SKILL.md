---
name: create-or-update-skill
description: Use when creating or updating a skill whenever a reusable workflow, constraint or lesson is learned during a session.
---

## What I do

I make sure that knowledge gained during a conversation is captured as a skill - either by creating a new one or updating an existing one - so it is not lost between sessions.

## The process

### Step 1 - Identify the learning

State clearly what was learned. One sentence. Answer: _"What would have gone wrong without this knowledge?"_

### Step 2 - Decide: new skill or update

- **New skill** if the learning is about a distinct workflow or domain not covered by an existing skill.
- **Update existing skill** if the learning refines, extends or corrects a rule in a skill that already exists.

To check existing skills, list `.apm/skills` and reveal relevant `SKILL.md` files.

### Step 3 - Make the change

- For a **new skill**: create a directory under `.apm/skills/<skill-name>` and write `SKILL.md` according to the [apm skill documentation](https://microsoft.github.io/apm/producer/author-primitives/skills/).
- For an **update**: use the edit tool to add or modify only the relevant section of the existing `SKILL.md`. Do not rewrite the whole file.

## Rules

- Keep skill description short, matchable and clearly distinct from other skills.
- Prefer updating an existing skill over creating a new one when the scope overlaps.
- Do not duplicate content accross skills. If a rule already exists in another skill reference it instead of copying it.
- Skills must be actionable. Avoid using vague advice like "be careful". Write concrete rules like "always do X before Y".
