import type { EntityId } from '~/types/ddd';
import type {
  ComputedRentalStatus,
  RentalDetails,
  RentedItem,
} from '~/types/rental';

export function computeRentalStatus(rental: {
  gear: RentalDetails['gear'];
  topos: RentalDetails['topos'];
  depositReturned: RentalDetails['depositReturned'];
}): ComputedRentalStatus {
  const gearStatus = computeRentedItemsStatus(rental.gear);
  const topoStatus = computeRentedItemsStatus(rental.topos);
  const isAllReturned = gearStatus.isAllReturned && topoStatus.isAllReturned;
  const isAnyReturned = gearStatus.isAnyReturned || topoStatus.isAnyReturned;
  if (isAllReturned && rental.depositReturned) return 'returned';
  if (isAnyReturned) return 'partially_returned';
  else return 'not_returned';
}

function computeRentedItemsStatus<T extends EntityId<unknown>>(
  items: RentedItem<T>[],
) {
  let isAllReturned = true;
  let isAnyReturned = false;
  for (const { rentedAmount, returnedAmount, itemsLost } of items) {
    const itemStatus = computeRentedItemStatus({
      rentedAmount,
      returnedAmount,
      lostAmount: sumOf(itemsLost, 'amount'),
    });
    if (itemStatus !== 'noneReturned') isAnyReturned = true;
    if (itemStatus !== 'allReturned') isAllReturned = false;
  }
  return { isAllReturned, isAnyReturned };
}

export function computeRentedItemStatus(args: {
  rentedAmount: number;
  returnedAmount: number;
  lostAmount: number;
}) {
  if (args.returnedAmount + args.lostAmount === args.rentedAmount)
    return 'allReturned';
  if (args.returnedAmount === 0) return 'noneReturned';
  else return 'someReturned';
}
