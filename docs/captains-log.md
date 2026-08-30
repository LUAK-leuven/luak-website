# The captains log

## 29/08/2026 - Typescript config & project structure for tests

> _author: Hektor_

### Context

When we migrated to Nuxt 4 the typescript behavior changed. Now there are 4 separate typescript projects: 'app', 'server', 'shared' and 'node'.
Initially I included the unit and e2e tests in the 'node' project thinking they don't need Nuxt's auto imports and aliases.

But when running `nuxt typecheck` I was getting a lot of unresolved imports from the `shared/` and `app/model/` directories. In the editor there was no error visible.
The underlying problem was transitive dependencies/imports. My tests were importing files from `shared/`, but those files do use Nuxt's import aliases. Which could not be resolved in the 'node' project. This also explains why I didn't get any errors in the IDE. Those files in the `shared/` folder resolve to the 'shared' project.

### Options

#### Option 1 - Create a separate typescript project for tests

This separate typescript project can extend the 'shared' project so that Nuxt's import aliases and auto-imports work.

```json
{
  "extends": "./.nuxt/tsconfig.shared.json",
  "include": [
    "./test/unit/**/*",
    "./test/integration/**/*",
    "./test/e2e/**/*",
    "./test/testUtils/**/*"
  ]
}
```

**pros**: Clean separation of tests from production code.
**cons**:
  - More custom config
  - It is not possible to set test aliases without overriding Nuxt's aliases

#### Option 2 - Include tests to the 'shared' project

Instead of including the test folders in the 'node' project, include them in the 'shared' project.

**pros**: By far the simplest solution.
**cons**: The `#test` alias is available in production code (this was also the case before).

#### Option 3 - Restructure the whole project

This is the "let's rewrite everything" option to restructure the whole project (including production code), so that the domain does not live in the Nuxt context and can easily be imported and tested without the need of Nuxt's aliases.

  **pros**: Solves other architectural issues.
  **cons**: Scope is way too large.

### Decision

I decided to go for option 2, because this is by far the simplest.

## 05/08/2026 - Membership validation

> _author: Hektor_

### Context

A membership has a `membershipYear` and a `createdOn` date. They should be consistent with each other, meaning that the `createdOn` date should be within the membership year. But changing the membership period would mean that some memberships would become "invalid" because their `createdOn` date would no longer be within the membership year.

### Options

1. Allow "invalid" memberships and make sure the code can deal with it.
2. Do a data migration to fix the invalid memberships. This is a one time operation, but if we change the membership period again in the future, we will have to do another data migration.

### Decision

I decided to allow "invalid" memberships, because this is the most flexible solution. If we change the membership period again in the future, we won't have to do a data migration.

## 12/07/2026 - Mark-as-lost endpoint

> _author: Hektor_

### Context

Initially I implemented the mark-as-lost as an api endpoint. But while implementing I realized that there are two operations that need to be done when marking an item as lost: insert event in InventoryItemEvents and update lost_amount in the RentedGear or RentedTopos table. Using supabase-js there are no transactions, so if one of the two operations fail, the database will be in an inconsistent state.

### Options

**Option 1**: Keep using supabase-js. -> This is the easiest solution but it will break eventually the database consistency.

**Option 2**: Use stored procedures in the database.

**Option 3**: Use an edge function to execute both operations in a single transaction using a postgres client connected directly to the postgres database. -> This is the cleanest solution but it adds a lot of complexity.

**Option 4**: Use a postgres client connected directly to the postgres database in the server. -> Also adds complexity.

### Decision

I decided to implement the mark-as-lost flow as a stored procedure in the database. This way both operations are executed in a single transaction. The downside is that the logic is now split between the application and the database and writing stored procedures is more difficult than writing code. But it's the only way to ensure the consistency of the database.

## 11/07/2026 - Lost-gear flow

> _author: Hektor_

### Context

In order to deal with lost gear, we need to be able to mark an item as lost. This will be recorded in the inventory and the rental.

### Options

**Option 1**: Move towards an event based architecture for both the inventory and the rental. This adds a lot of complexity and requires to rebuild the current rental system.

**Option 2**: Mark item as returned in the rental and archive the inventory item. The 'archived' status in the inventory applies on all items, so this option wouldn't allow to lose 1 item if there are multiple items of the same type in the inventory.

**Option 3**: Add LostGear and LostTopos tables to track lost items. Both rental and inventory join on this table to get the lost status of an item.

### Decision

A combination of options 1 and 3:

In the rental I decided to add a column with the lost_amount. This allows to easily compute the current available amount of an item.

For the inventory I added the 'InventoryItemEvents' table containing the history of all events related to an inventory item (which can be a gear item or a topo). This event based approach allows to easily add new events in the future such as logs, item being archived, etc... without having to change the inventory item model.

## 15/05/2026 - Remove rental status from DB

> _author: Hektor_

### Context

While adding the lost-gear flow I noticed the rental status was no longer correct after marking an item as lost. This was because the status (saved on the rental) was not updated when marking an item as lost. Actually the rental status is a computed property on a rental.

### Options

1. When marking an item as lost, also update the status on a rental.
  - pros:
  - cons: need to fetch the rental and all it's items in order to re-compute the status.
2. Remove the status field from the rental in the DB, and allways compute it base on the saved rental.
  - pros: no longer need to sync the status for any change made on a rental
  - cons: the status needs to be computed wherever it is needed. For this we need to fetch all rented items.

### Decision

**option 2**: Because it is the cleanest and most future-proof solution.