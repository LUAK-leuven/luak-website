# Backend owns application logic

> Status: Accepted

## Context

The Nuxt application currently has business logic and Supabase access in both the frontend and backend. This makes the frontend services and domain models responsible for more than presentation, and allows business rules to be duplicated or bypassed.

The frontend should remain a view over application data while retaining a pragmatic exception for simple, business-rule-free Supabase interactions.

## Decision

The Nitro backend is the application boundary for business logic and non-trivial data access.

- The browser keeps its Supabase client for authentication.
- A direct frontend Supabase call is allowed only for a single-table read or update with no derived values, multi-step write, or business rule.
- All other reads and writes use REST-style Nitro endpoints and the user-scoped Supabase client.
- RLS remains the authorization layer; this decision does not introduce server auth helpers.
- Multi-step writes continue to use PostgreSQL stored procedures, as described in [ADR-001](001-transactions.md).
- Frontend calls use plain `$fetch` through thin composables.

### Logic and data boundaries

- Endpoints validate body, query, and route parameters through `luakEventHandler`.
- API errors use `{ code, message, fieldErrors }`.
- DTOs contain server-computed derived values such as rental status, unreturned amounts, display names, and membership validity.
- Domain classes and authoritative business rules move to `server/domain`.
- Dependency-free preview functions may live in `shared/` and be used by the frontend for immediate feedback. They accept `now` explicitly where time is involved.
- The server always recomputes and enforces these values. Shared preview logic is not an authorization or persistence boundary.
- Input schemas are shared between frontend validation and server validation. The validation library is intentionally not decided by this ADR.

## Intentional exceptions and scope

The following remain frontend concerns for now:

- Authentication flows and the browser Supabase client.
- Profile `Users` update.
- Signup `Users` insert.
- CSV export.

Out of scope are auth helpers and `/api/me`, lint enforcement, Stripe/payment changes, validation-library changes, and RLS/grant hardening.

## Consequences

The backend becomes the single source of truth for business behavior and DTOs. The frontend has less domain code and simpler data access, but must use API contracts and may need shared pure preview functions for responsive UI feedback. RLS and database procedures remain important because the server boundary does not replace database enforcement.
