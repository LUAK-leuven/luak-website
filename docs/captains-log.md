# The captains log

## 15/05/2026 - Remove rental status from DB

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