import { expect, test } from 'vitest';

import {
  createDepositFee,
  createOutstandingAmount,
  createRentalMemberName,
} from '#shared/api/rest/rental';

test.describe('createDepositFee', () => {
  test('accepts zero and positive integer fees', () => {
    expect(createDepositFee(0)).toBe(0);
    expect(createDepositFee(125)).toBe(125);
  });

  test('rejects fractional fees', () => {
    expect(() => createDepositFee(1.5)).toThrow();
  });

  test('rejects negative fees', () => {
    expect(() => createDepositFee(-1)).toThrow();
  });
});

test.describe('createOutstandingAmount', () => {
  test('accepts nonnegative integers', () => {
    expect(createOutstandingAmount(3)).toBe(3);
  });

  test('rejects fractional amounts', () => {
    expect(() => createOutstandingAmount(1.5)).toThrow();
  });

  test('rejects negative amounts', () => {
    expect(() => createOutstandingAmount(-1)).toThrow();
  });
});

test.describe('createRentalMemberName', () => {
  test('accepts a nonempty name', () => {
    expect(createRentalMemberName('Ada Lovelace')).toBe('Ada Lovelace');
  });

  test('rejects an empty name', () => {
    expect(() => createRentalMemberName('')).toThrow();
  });
});
