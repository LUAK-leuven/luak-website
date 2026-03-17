import type { EntityId } from '~/types/common';
import type { Enums } from '~/types/database.types';
import type { GearItemId, TopoId } from '~/types/gear';

export function computeRentalStatus(
  rentedGear: Record<GearItemId, number>,
  returnedGear: Record<GearItemId, number>,
  rentedTopos: Record<TopoId, number>,
  returnedTopos: Record<TopoId, number>,
  depositReturned: boolean,
): Enums<'rental_status'> {
  const gearStatus = computeRentedItemsStatus(rentedGear, returnedGear);
  const topoStatus = computeRentedItemsStatus(rentedTopos, returnedTopos);
  const isAllReturned = gearStatus.isAllReturned && topoStatus.isAllReturned;
  const isAnyReturned = gearStatus.isAnyReturned || topoStatus.isAnyReturned;
  if (isAllReturned && depositReturned) return 'returned';
  if (isAnyReturned) return 'partially_returned';
  else return 'not_returned';
}

function computeRentedItemsStatus<T extends EntityId<unknown>>(
  rentedAmount: Record<T, number>,
  returnedAmount: Record<T, number>,
) {
  let isAllReturned = true;
  let isAnyReturned = false;
  for (const [key, value] of Object.entries(rentedAmount) as [T, number][]) {
    const returned = returnedAmount[key] ?? 0;
    if (returned > 0) isAnyReturned = true;
    if (returned !== value) isAllReturned = false;
  }
  return { isAllReturned, isAnyReturned };
}

export function computeRentalStatusUnsafe(
  rentedGear: number[],
  returnedGear: number[],
  rentedTopos: number[],
  returnedTopos: number[],
  depositReturned: boolean,
): Enums<'rental_status'> {
  const rentalStatus = computeRentedItemsStatusUnsafe(
    rentedGear.concat(rentedTopos),
    returnedGear.concat(returnedTopos),
  );
  if (rentalStatus === 'fully_returned' && depositReturned) return 'returned';
  if (rentalStatus === 'not_returned') return 'not_returned';
  else return 'partially_returned';
}

function computeRentedItemsStatusUnsafe(
  rentedAmount: number[],
  returnedAmount: number[],
): 'fully_returned' | 'partially_returned' | 'not_returned' {
  let isAllReturned = true;
  let isAnyReturned = false;
  for (let i = 0; i < rentedAmount.length; i++) {
    if (returnedAmount[i] > 0) isAnyReturned = true;
    if (returnedAmount[i] !== rentedAmount[i]) isAllReturned = false;
  }
  return isAllReturned
    ? 'fully_returned'
    : isAnyReturned
      ? 'partially_returned'
      : 'not_returned';
}
