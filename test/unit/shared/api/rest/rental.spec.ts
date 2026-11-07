import { expect, test } from 'vitest';
import {
  createOutstandingAmount,
  createRentalMemberName,
} from '#shared/api/rest/rental';

test('createOutstandingAmount accepts nonnegative integers', () => {
  expect(createOutstandingAmount(3)).toBe(3);
});

test('createOutstandingAmount rejects fractional amounts', () => {
  expect(() => createOutstandingAmount(1.5)).toThrow();
});

test('createOutstandingAmount rejects negative amounts', () => {
  expect(() => createOutstandingAmount(-1)).toThrow();
});

test('createRentalMemberName accepts a nonempty name', () => {
  expect(createRentalMemberName('Ada Lovelace')).toBe('Ada Lovelace');
});

test('createRentalMemberName rejects an empty name', () => {
  expect(() => createRentalMemberName('')).toThrow();
});
