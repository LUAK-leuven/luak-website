export function computeRentalStatus(
  rentedGear: number[],
  returnedGear: number[],
  rentedTopos: number[],
  returnedTopos: number[],
  depositReturned: boolean,
) {
  const gearStatus = computeRentedItemsStatus(rentedGear, returnedGear);
  const topoStatus = computeRentedItemsStatus(rentedTopos, returnedTopos);
  const isAllReturned =
    gearStatus === 'fully_returned' && topoStatus === 'fully_returned';
  const isNotReturned =
    gearStatus === 'not_returned' && topoStatus === 'not_returned';
  if (isAllReturned && depositReturned) return 'returned';
  if (isNotReturned) return 'not_returned';
  else return 'partially_returned';
}

function computeRentedItemsStatus(
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
