import type { EntityId } from '~/types/ddd';
import type { Enums } from '~/types/database.types';
import type { GearItemId, TopoId } from '~/types/gear';

export function computeRentalStatus(args: {
  rentedGear: Record<GearItemId, number>;
  returnedGear: Record<GearItemId, number | undefined>;
  rentedTopos: Record<TopoId, number>;
  returnedTopos: Record<TopoId, number | undefined>;
  depositReturned: boolean;
}): Enums<'rental_status'> {
  const gearStatus = computeRentedItemsStatus({
    rentedAmount: args.rentedGear,
    returnedAmount: args.returnedGear,
  });
  const topoStatus = computeRentedItemsStatus({
    rentedAmount: args.rentedTopos,
    returnedAmount: args.returnedTopos,
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
}) {
  let isAllReturned = true;
  let isAnyReturned = false;
  for (const [key, value] of Object.entries(args.rentedAmount) as [
    T,
    number,
  ][]) {
    const returned = args.returnedAmount[key] ?? 0;
    if (returned > 0) isAnyReturned = true;
    if (returned !== value) isAllReturned = false;
  }
  return { isAllReturned, isAnyReturned };
}
