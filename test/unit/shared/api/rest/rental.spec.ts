import { expect, test } from 'vitest';

import {
  createDepositFee,
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

test.describe('createRentalMemberName', () => {
  test('accepts a nonempty name', () => {
    expect(createRentalMemberName('Ada Lovelace')).toBe('Ada Lovelace');
  });

  test('rejects an empty name', () => {
    expect(() => createRentalMemberName('')).toThrow();
  });
});
