import { createDepositFee, createRentalId } from '#shared/api/rest/rental';
import {
  createRentalItemId,
  createRentalItemName,
  RentalItemType,
} from '#shared/api/rest/rental/rentalItem';
import type {
  PaymentMethod,
  SavedRental,
  UnsavedRental,
} from '#shared/types/rental';
import { randomBool, randomInt, randomOf } from '#shared/utils/utils';
import { aRandomGearItemId, aRandomUserId } from '#test/builders/ids';
import { RentalItem, RentalSummary } from '~/model/Rental';

export const aRandomRentalId = () => createRentalId(crypto.randomUUID());

export const aRandomDepositFee = () =>
  createDepositFee(randomOf([0, randomInt(1, 100)]));

export const aRandomPaymentMethod = (): PaymentMethod =>
  randomOf(['cash', 'transfer']);

export const aRandomRentalItemId = () =>
  createRentalItemId(crypto.randomUUID());

type RentalSummaryArgs = ConstructorParameters<typeof RentalSummary>[0];

export const aRentalSummary = (
  args: Partial<RentalSummaryArgs>,
): RentalSummary => {
  const defaultArgs: RentalSummaryArgs = {
    id: aRandomRentalId(),
    gear: [],
    topos: [],
    dateBorrow: '2024-01-01',
    dateReturn: '2024-01-01',
    depositFee: aRandomDepositFee(),
    depositReturned: randomBool(),
    memberName: 'John Doe',
  };
  return new RentalSummary({
    ...defaultArgs,
    ...args,
  });
};

export const aRentalInput = (
  args: Partial<UnsavedRental> = {},
): UnsavedRental => {
  const defaultRental: UnsavedRental = {
    memberId: aRandomUserId(),
    contactInfo: undefined,
    boardMemberId: aRandomUserId(),
    gear: {},
    topos: {},
    dateBorrow: '2024-01-01',
    dateReturn: '2024-01-01',
    depositFee: aRandomDepositFee(),
    paymentMethod: aRandomPaymentMethod(),
    comments: undefined,
  };
  return {
    ...defaultRental,
    ...args,
  };
};

export const aRental = (args: Partial<SavedRental> = {}): SavedRental => ({
  ...aRentalInput(args),
  id: args.id ?? aRandomRentalId(),
});

export const aRentalItem = (
  args: Partial<ConstructorParameters<typeof RentalItem>[0]> = {},
): RentalItem => {
  const rentedAmount =
    args.rentedAmount === undefined ? randomInt(1, 10) : args.rentedAmount;
  const returnedAmount =
    args.returnedAmount === undefined
      ? randomInt(0, rentedAmount)
      : args.returnedAmount;
  const lostAmount = args.lostAmount === undefined ? 0 : args.lostAmount;

  return new RentalItem({
    id: args.id ?? aRandomGearItemId(),
    name: args.name ?? createRentalItemName('Item name'),
    rentedAmount,
    returnedAmount,
    lostAmount,
    type: args.type ?? RentalItemType.gear,
  });
};
