---
name: investigate-dependency-behavior
description: Use whenever you need to understand how a dependency (Nuxt, a Nuxt module, an npm package) behaves, is configured, or can be configured — before reading its source in node_modules.
---

## Rule

Never start by reading a package's source code under `node_modules/` to answer "how does X work" or "can X be configured to do Y". Reading compiled/bundled source is slow, error-prone (minified, hard to map to behavior) and easy to misread — it previously led to a wrong conclusion (assuming a config option existed) and to a retracted recommendation.

## Process

1. **Check the installed version first.** Read `package.json` (or the lockfile) for the exact version/range in use.
2. **Use the package's own documentation tools/MCP resources if available** (e.g. this project has `nuxt_get-documentation-page`, `nuxt_list-documentation-pages`). Prefer these over generic web search.
3. **Match the docs version to the installed version.** Nuxt docs are versioned (`3.x`, `4.x`, `5.x`) — always pass the matching `version` param. A behavior documented for a different major version may not apply.
4. **If docs don't cover the specific question**, check the package's changelog/release notes for the relevant version.
5. **Only fall back to reading `node_modules` source** when the above are exhausted or the question is about an actual bug/edge case not covered by docs — and say so explicitly before doing it.

## Example lesson

Investigated whether Nuxt's `shared/types` auto-import scanning could be disabled per-directory by reading `node_modules/nuxt/dist/index.mjs`. The docs (`/docs/4.x/directory-structure/shared`, `/docs/4.x/guide/concepts/auto-imports`) would have given the authoritative answer directly (no per-directory option exists; only global `imports.autoImport`/`imports.scan`) without needing to read bundled source at all.
