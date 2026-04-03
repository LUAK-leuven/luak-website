# Spec: Remove Devcontainer and Switch to Local Dev Setup

## Goal

Remove the devcontainer configuration and update the project so developers can work
directly on their local machine without Docker or VS Code Remote Containers.

---

## Background

The current setup uses a devcontainer defined in `.devcontainer/devcontainer.json`.
It provides:

- Node 20 (Debian Bullseye image) — **conflicts** with `.nvmrc` which pins `v22.17.1`
- Docker-in-Docker (used by `supabase start` to run the local Supabase stack)
- Playwright + Chromium installed via post-start scripts
- A set of recommended VS Code extensions
- Port 3000 forwarded for the Nuxt dev server

In a local setup these responsibilities shift to the developer's machine.

---

## Changes Required

### 1. Delete devcontainer configuration

Remove the directory and all its contents:

```
.devcontainer/
```

### 2. Remove Dependabot devcontainer tracking

In `.github/dependabot.yml`, remove the `devcontainers` entry:

```yaml
# Remove this block:
  - package-ecosystem: 'devcontainers'
    directory: '/'
    schedule:
      interval: weekly
```

If this leaves the file empty (no other `updates` entries), remove the file entirely.

### 3. Add a VS Code extensions recommendation file

The devcontainer carried the VS Code extension list. Move it to
`.vscode/extensions.json` so it works for local VS Code installs too:

```json
{
  "recommendations": [
    "Vue.volar",
    "esbenp.prettier-vscode",
    "Etsi0.class-collapse",
    "bradlc.vscode-tailwindcss",
    "tamasfe.even-better-toml",
    "bierner.emojisense",
    "denoland.vscode-deno",
    "Nuxt.mdc",
    "ms-playwright.playwright"
  ]
}
```

Check whether `.vscode/extensions.json` already exists; if so, merge without
duplicating entries.

### 4. Update README.md setup instructions

Replace the devcontainer-first setup section with local prerequisites and steps.
The new instructions should cover:

**Prerequisites**

- Node.js — use [nvm](https://github.com/nvm-sh/nvm) and run `nvm use`
  (`.nvmrc` is present and pins the correct version)
- Yarn 1.22 — enabled via Corepack: `corepack enable`
- Docker Desktop (still required for `supabase start` which manages the local
  Supabase stack)
- Supabase CLI — install via Homebrew (`brew install supabase/tap/supabase`) or
  the [official docs](https://supabase.com/docs/guides/cli/getting-started)

**Steps**

1. Install Node: `nvm install && nvm use`
2. Enable Corepack: `corepack enable`
3. Install dependencies: `yarn install`
4. Copy env file: `cp .env.example .env.local` and fill in Supabase credentials
5. Start Supabase local stack: `supabase start`
6. Start dev server: `yarn dev`

**Playwright (e2e tests only)**

Playwright system dependencies are no longer installed automatically.
Developers who need to run e2e tests must install them manually:

```bash
yarn playwright install-deps
yarn playwright install chromium
```

On macOS, `install-deps` is a no-op; only `install chromium` is needed.

### 5. Align Node version across all environments

There are currently three different Node versions in play:

| Where | Version |
|-------|---------|
| Devcontainer image | Node 20 |
| `.nvmrc` | v22.17.1 (Node 22) |
| Vercel (production) | Node 20 |

This is a real risk: `better-sqlite3` (a native addon in `dependencies`) must be
compiled for the Node version that actually runs the code. A binary compiled on
Node 22 locally will not load on Vercel's Node 20 runtime. Additionally, any
Node 22-only API used in code will fail silently or crash in production.

**Decision required: pick one Node major version and apply it everywhere.**

Two options:

- **Standardise on Node 22** — update Vercel project settings to Node 22, keep
  `.nvmrc` at `v22.x.x`. Node 22 is an active LTS release and is fully supported
  by Nuxt 3.
- **Standardise on Node 20** — update `.nvmrc` to a Node 20 release (e.g.
  `v20.19.1`), keep Vercel at Node 20.

Whichever is chosen, update all three locations atomically:

1. `.nvmrc` — set to the chosen version
2. Vercel project settings → General → Node.js Version
3. (After removing the devcontainer) no further action needed there

---

## What Stays the Same

- Docker is still required — only for running the local Supabase stack via
  `supabase start`. The Docker-in-Docker feature from the devcontainer is no longer
  needed because Docker runs natively on the developer's machine.
- All commands in `AGENTS.md` remain unchanged.
- `.npmrc` (`shamefully-hoist=true`) remains unchanged.
- The Supabase CLI workflow is unchanged.

---

## Files to Create / Modify / Delete

| Action | Path |
|--------|------|
| Delete | `.devcontainer/devcontainer.json` |
| Delete | `.devcontainer/` (directory) |
| Modify | `.github/dependabot.yml` — remove `devcontainers` entry |
| Create | `.vscode/extensions.json` — VS Code extension recommendations |
| Modify | `README.md` — replace devcontainer setup with local setup instructions |
| Modify | `.nvmrc` — align to chosen Node version |
