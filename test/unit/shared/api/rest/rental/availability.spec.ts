import { expect, test } from 'vitest';

import { createAvailableAmount } from '#shared/api/rest/rental/availability';

test.describe('AvailableAmount', () => {
  test('accepts negative integers', () => {
    expect(createAvailableAmount(-2)).toBe(-2);
  });

  test('rejects fractional values', () => {
    expect(() => createAvailableAmount(-1.5)).toThrow();
  });
});
