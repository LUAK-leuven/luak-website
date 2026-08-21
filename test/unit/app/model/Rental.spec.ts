import { describe, expect, test } from 'vitest';
import { RentalGearItem, RentalSummary } from '~/app/model/Rental';
import type { GearItemId } from '~/shared/types/gear';
import type { RentalId } from '~/shared/types/rental';
import { randomBool, randomInt, randomOf } from '~/shared/utils/utils';

describe('Rental status', () => {
  test('"returned" when all items are returned and deposit is returned', () => {
    const rental = aRentalSummary({
      depositReturned: true,
      gear: [aRentalGearItem({ rentedAmount: 1, returnedAmount: 1 })],
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
      gear: [aRentalGearItem({ rentedAmount: 1, returnedAmount: 1 })],
    });

    expect(rental.status).toBe('partially_returned');
  });
});

type RentalSummaryArgs = ConstructorParameters<typeof RentalSummary>[0];

const aRentalSummary = (args: Partial<RentalSummaryArgs>): RentalSummary => {
  const defaultArgs: RentalSummaryArgs = {
    id: crypto.randomUUID() as RentalId,
    gear: [],
    topos: [],
    dateBorrow: '2024-01-01',
    dateReturn: '2024-01-01',
    depositFee: randomOf([0, randomInt(1, 100)]),
    depositReturned: randomBool(),
    memberName: 'John Doe',
  };
  return new RentalSummary({
    ...defaultArgs,
    ...args,
  });
};

type RentalGearItemArgs = ConstructorParameters<typeof RentalGearItem>[0];

const aRentalGearItem = (
  args: Partial<RentalGearItemArgs> = {},
): RentalGearItem => {
  const rentedAmount =
    args.rentedAmount === undefined ? randomInt(1, 10) : args.rentedAmount;
  const returnedAmount =
    args.returnedAmount === undefined
      ? randomInt(0, rentedAmount)
      : args.returnedAmount;
  const lostAmount = args.lostAmount === undefined ? 0 : args.lostAmount;

  return new RentalGearItem({
    id: args.id ?? (crypto.randomUUID() as GearItemId),
    name: args.name ?? 'Gear Item',
    rentedAmount,
    returnedAmount,
    lostAmount,
  });
};
