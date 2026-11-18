import { expect, test } from 'vitest';

import { aRentalItem, aRentalSummary } from '#test/builders/rental';

test.describe('Rental status', () => {
  test('"returned" when all items are returned and deposit is returned', () => {
    const rental = aRentalSummary({
      depositReturned: true,
      gear: [aRentalItem({ rentedAmount: 1, returnedAmount: 1 })],
    });

    expect(rental.status).toBe('returned');
  });

  test('"not returned" when deposit is not returned', () => {
    const rental = aRentalSummary({
      depositReturned: false,
    });

    expect(rental.status).toBe('not_returned');
  });

  test('"partially returned" when an item is returned', () => {
    const rental = aRentalSummary({
      depositReturned: false,
      gear: [aRentalItem({ rentedAmount: 1, returnedAmount: 1 })],
    });

    expect(rental.status).toBe('partially_returned');
  });
});
