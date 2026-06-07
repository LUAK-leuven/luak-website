import type { EntityId } from '~/types/ddd';
import type { GearItemId, TopoId } from '~/types/gear';
import type {
  ComputedRentalStatus,
  RentalDetails,
  RentedItem,
} from '~/types/rental';

export function computeRentalStatus(args: {
  rentedGear: Record<GearItemId, number>;
  returnedGear: Record<GearItemId, number | undefined>;
  lostGear: Record<GearItemId, number | undefined>;
  rentedTopos: Record<TopoId, number>;
  returnedTopos: Record<TopoId, number | undefined>;
  lostTopos: Record<TopoId, number | undefined>;
  depositReturned: boolean;
}): ComputedRentalStatus {
  const gearStatus = computeRentedItemsStatus({
    rentedAmount: args.rentedGear,
    returnedAmount: args.returnedGear,
    lostAmount: args.lostGear,
  });
  const topoStatus = computeRentedItemsStatus({
    rentedAmount: args.rentedTopos,
    returnedAmount: args.returnedTopos,
    lostAmount: args.lostTopos,
  });
  const isAllReturned = gearStatus.isAllReturned && topoStatus.isAllReturned;
  const isAnyReturned = gearStatus.isAnyReturned || topoStatus.isAnyReturned;
  if (isAllReturned && args.depositReturned) return 'returned';
  if (isAnyReturned) return 'partially_returned';
  else return 'not_returned';
}

function computeRentedItemsStatus<T extends EntityId<unknown>>(args: {
  rentedAmount: Record<T, number>;
  returnedAmount: Record<T, number | undefined>;
  lostAmount: Record<T, number | undefined>;
}) {
  let isAllReturned = true;
  let isAnyReturned = false;
  for (const key of Object.keys(args.rentedAmount) as T[]) {
    const itemStatus = computeRentedItemStatus({
      rentedAmount: args.rentedAmount[key],
      returnedAmount: args.returnedAmount[key] ?? 0,
      lostAmount: args.lostAmount[key] ?? 0,
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

export function computeRentalStatus_v2(rental: {
  gear: RentalDetails['gear'];
  topos: RentalDetails['topos'];
  depositReturned: RentalDetails['depositReturned'];
}): ComputedRentalStatus {
  const gearStatus = computeRentedItemsStatus_v2(rental.gear);
  const topoStatus = computeRentedItemsStatus_v2(rental.topos);
  const isAllReturned = gearStatus.isAllReturned && topoStatus.isAllReturned;
  const isAnyReturned = gearStatus.isAnyReturned || topoStatus.isAnyReturned;
  if (isAllReturned && rental.depositReturned) return 'returned';
  if (isAnyReturned) return 'partially_returned';
  else return 'not_returned';
}

function computeRentedItemsStatus_v2<T extends EntityId<unknown>>(
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
