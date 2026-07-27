# The captains log

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