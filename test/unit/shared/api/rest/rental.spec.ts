import { expect, test } from 'vitest';
import { createOutstandingAmount } from '#shared/api/rest/rental';

test('createOutstandingAmount accepts nonnegative integers', () => {
  expect(createOutstandingAmount(3)).toBe(3);
});

test('createOutstandingAmount rejects fractional amounts', () => {
  expect(() => createOutstandingAmount(1.5)).toThrow();
});

test('createOutstandingAmount rejects negative amounts', () => {
  expect(() => createOutstandingAmount(-1)).toThrow();
});
