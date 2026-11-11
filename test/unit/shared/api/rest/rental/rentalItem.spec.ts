import { expect, test } from 'vitest';

import {
  createOutstandingAmount,
  createRentalItemName,
  createRentalItemType,
} from '#shared/api/rest/rental/rentalItem';

test.describe('createRentalItemName', () => {
  test('accepts a nonempty name', () => {
    expect(createRentalItemName('quickdraw')).toBe('quickdraw');
  });

  test('rejects an empty name', () => {
    expect(() => createRentalItemName('')).toThrow();
  });
});

test.describe('createRentalItemType', () => {
  test('accepts gear and topo', () => {
    expect(createRentalItemType('gear')).toBe('gear');
    expect(createRentalItemType('topo')).toBe('topo');
  });

  test('rejects unknown types', () => {
    expect(() => createRentalItemType('tent')).toThrow();
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
