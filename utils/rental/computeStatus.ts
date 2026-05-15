import type { EntityId } from '~/types/ddd';
import type { GearItemId, TopoId } from '~/types/gear';
import type { ComputedRentalStatus } from '~/types/rental';

export function computeRentalStatus(args: {
  rentedGear: Record<GearItemId, number>;
  returnedGear: Record<GearItemId, number | undefined>;
  rentedTopos: Record<TopoId, number>;
  returnedTopos: Record<TopoId, number | undefined>;
  lostTopos: Record<TopoId, number>;
  depositReturned: boolean;
}): ComputedRentalStatus {
  const gearStatus = computeRentedItemsStatus({
    rentedAmount: args.rentedGear,
    returnedAmount: args.returnedGear,
    lostAmount: {},
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
  lostAmount: Record<T, number>;
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
