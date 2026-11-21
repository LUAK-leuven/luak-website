import { expect, test } from 'vitest';

import {
  createOutstandingAmount,
  createRentalItemName,
} from '#shared/api/rest/rental/rentalItem';

test.describe('createRentalItemName', () => {
  test('accepts a nonempty name', () => {
    expect(createRentalItemName('quickdraw')).toBe('quickdraw');
  });

  test('rejects an empty name', () => {
    expect(() => createRentalItemName('')).toThrow();
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
