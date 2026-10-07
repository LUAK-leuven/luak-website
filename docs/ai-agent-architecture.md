# Architecture guidance for AI agents

This document records the agreed architecture direction and migration context. Read it before changing data access or moving business logic.

## Goal

Make the frontend primarily a view over data. Move application logic and non-trivial Supabase access to the Nitro backend while keeping a pragmatic exception for simple direct calls.

## Rules

### Frontend Supabase usage

The browser keeps Supabase for authentication. A direct data call is allowed only when it is:

- a single-table read or update;
- free of derived values;
- free of business rules; and
- not a multi-step write.

Otherwise use a REST-style Nitro endpoint and plain `$fetch`, usually wrapped in a thin composable. Do not add lint enforcement for this rule.

### Backend and database

- Use the user-scoped Supabase client on the server so RLS applies.
- RLS is the authorization layer. Do not add auth helpers or `/api/me` as part of this migration.
- Keep multi-step writes in PostgreSQL stored procedures/RPCs, per [`docs/adr/001-transactions.md`](adr/001-transactions.md).
- Server code should supply session-derived values such as the board-member ID rather than trusting equivalent client input.
- Do not include Stripe/payment changes or RLS/grant hardening in this migration.

### API conventions

Prefer routes such as:

```text
POST  /api/rentals
PATCH /api/rentals/:id
POST  /api/rentals/:id/return
POST  /api/gear/:id/lost
GET   /api/members
```

`luakEventHandler` validates body, query, and params. Return typed errors with:

```ts
{ code, message, fieldErrors }
```

## Logic placement

- DTOs should include server-computed fields: rental status, unreturned amounts, display names, and membership `isActive`.
- Move authoritative domain classes and rules to `server/domain`.
- Put dependency-free preview functions in `shared/` when the UI needs dynamic early feedback. Pass `now` explicitly to time-dependent functions.
- The frontend may use shared pure logic for previews, such as rental status during editing. The server must always recompute and enforce the result.
- Shared input schemas are used for frontend early validation and server validation. The validation-library choice is not part of this decision.
- The rental form uses current available stock, not total inventory, for amount validation. Availability is folded into the rentals work and means current stock only; date-range availability is not planned.

## Per-domain layering

Each domain (e.g. `topo`, `gear`, `rental`) follows this structure, modeled after the `topo` migration:

- `server/domain/<domain>/<domain>.ts` — domain types and classes (e.g. `Topo`, `TopoCondition`). Pure: no imports from Supabase, adapters, `server/service`, or Nuxt/Nitro. The only allowed exception is types from `shared/api/rest/*`.
- `server/domain/<domain>/repository.ts` — the repository interface only (e.g. `TopoRepository`). Import types from `./<domain>.ts`; do not declare types here.
- `server/domain/<domain>/service.ts` — the service interface only (e.g. `TopoService`). Same rule: import types, don't declare them here.
- `server/adapter-supabase/<domain>/repository.ts` — the Supabase implementation (e.g. `SupabaseTopoRepository implements TopoRepository`). This is where DB enum/row shapes are mapped to domain types; use an explicit mapper function (e.g. `mapTopoCondition`) rather than casting.
- `server/service/<domain>.ts` — the service implementation (e.g. `TopoServiceImpl implements TopoService`), depending on the repository interface, not the concrete adapter.
- `shared/api/rest/<domain>.ts` — DTOs returned by API routes (e.g. `TopoDetails`), plus any identifier/enum type that both the API and the domain need (e.g. `TopoId`, `TopoCondition`). `shared/` cannot import from `server/`, so when the domain needs a type that `shared/` also needs, define it in `shared/api/rest/*` and have the domain re-export it — don't define it in `shared/types/*` and don't duplicate it.
- `server/api/<domain>/*.ts` — stays a thin route: validate params, call the service, return its result.

Import types explicitly; don't rely on global auto-import for domain identifiers like `TopoId`.

## Migration sequence

Work incrementally, one focused PR at a time. Before migrating an insufficiently tested domain, add tests for current behavior. Each migration removes the unused code it replaces.

1. **Inventory:** move remaining gear reads behind the API; add request validation and API error infrastructure.
2. **Rentals:** move rental reads/writes and current-stock availability.
3. **Lost gear:** move lost-gear operations; this follows rentals because it depends on rental and inventory domains.
4. **Members:** move `Membership` and membership-year rules; move the subscription list to `/api/members` because it derives membership validity.

## Intentional exceptions

These remain direct/frontend concerns unless a later decision changes the scope:

- Auth flows and the browser Supabase client.
- Profile `Users` update.
- Signup `Users` insert.
- CSV export.

Do not move the Stripe webhook/payment flow, add auth helpers, switch validation libraries, add lint restrictions, or harden RLS/grants as part of this plan.

## Testing expectations

Use all testing levels:

- unit tests for pure/domain behavior and mapping;
- local-Supabase integration tests for every endpoint;
- end-to-end tests for user workflows.

Write current-behavior tests before moving code, then preserve them through the migration. The overall work is complete when replaced frontend services/models are removed, only auth and explicitly allow-listed simple calls remain in `app/`, every endpoint has integration coverage, and end-to-end tests pass.

## Reference decision

The formal decision is in [`docs/adr/002-backend-owns-application-logic.md`](adr/002-backend-owns-application-logic.md).
