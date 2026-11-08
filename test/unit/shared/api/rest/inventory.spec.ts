import { expect, test } from 'vitest';
import { createAvailableAmount } from '#shared/api/rest/inventory';

test('AvailableAmount accepts negative integers', () => {
  expect(createAvailableAmount(-2)).toBe(-2);
});

test('AvailableAmount rejects fractional values', () => {
  expect(() => createAvailableAmount(-1.5)).toThrow();
});
