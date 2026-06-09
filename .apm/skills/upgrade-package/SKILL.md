---
name: upgrade-package
description: Use this skill whenever a package upgrade is requested, whether a single package or multiple.
---

## Step 1 — Identify impacted functionalities

1. Search the **source code** for direct imports of the package (`grep`/`Grep` tool).
2. Check `yarn.lock` (or the relevant lockfile) to find **which other packages also depend on it** transitively — a package that appears only in `yarn.lock` and not in source code is a transitive dependency of something else.
3. For each consumer found, identify which **features or pages** rely on it at runtime or build time.
4. Distinguish build-time-only impact (e.g. type generation, bundling) from **runtime impact** (e.g. SQLite content queries, native addons serving live requests).

> Example lesson learned: `better-sqlite3` was not imported anywhere in the application source, but it is the SQLite driver for `@nuxt/content` (via `db0`) — the primary consumer. Checking only source imports would have missed the most important impact.

## Step 2 — Assess the impact of the upgrade

1. Check the **current version** from `package.json` and the **latest version** from `npm show <package> version`.
2. For **patch/minor** upgrades: low risk, focus on verification.
3. For **major** upgrades: fetch the changelog or release notes (npm page, GitHub releases) and identify breaking changes, removed APIs, or changed behavior.
4. For **native addons** (e.g. `better-sqlite3`, `sharp`): note that the native bindings must be recompiled for the current Node.js ABI. Yarn/npm do this during install via a postinstall build step — verify it ran.

## Step 3 — Risk analysis

Answer these questions before upgrading:

| Question | Why it matters |
|---|---|
| Is the impacted functionality covered by **unit tests**? | Unit tests may not exercise all layers (e.g. a component test won't test a SQLite content pipeline). |
| Is the impacted functionality covered by **e2e tests**? | E2e tests are the strongest signal for runtime correctness. |
| Can it be verified by a **build** (`yarn build`)? | A successful build confirms build-time tools (type generation, bundlers, content indexing) work. |
| Is **manual verification** needed? | Some things (UI rendering, edge deployments) require a running server check. |
| Can the impacted functionality be covered by adding new tests? | This project doesn't have much coverage, so often adding a test is the solution. |

Choose the strongest available verification method. Do not rely solely on unit tests when the package operates at a different layer. When tests are missing for impacted functionalities, clearly state this.

## Step 4.1 — A major upgrade

For a **major** upgrade: you will **not implement anything** yet. This upgrade requires thourough analysis and planning.

## Step 4.2 - A minor or patch upgrade

1. Add the missing tests from Step 3.
1. Edit `package.json`: update the version range to `^<latest>`.
2. Run `yarn install` (or the project's package manager).
3. Confirm the lockfile was updated (`success Saved lockfile` for yarn, or equivalent).
4. If the package is a native addon, confirm the build step ran (look for "Building fresh packages" in yarn output).

## Step 5 — Verify

Use the verification method identified in Step 3. In order of preference:

1. **`yarn build`** — the strongest single check: exercises the full build pipeline, content indexing, type generation, and SSR bundling. A successful build with no errors confirms correctness at every layer. But does not confirm runtime behavior.
2. **`yarn test:unit`** — confirms component/unit logic is intact.
3. **`yarn lint`** — catches TypeScript regressions introduced by changed types.
4. **`yarn test:e2e`** — confirms runtime behaviour end-to-end (slow; use when build alone is insufficient).

Always report which verification was run and what its output confirmed.
