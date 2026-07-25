import { describe, expect, test } from 'vitest';
import getMembershipYear, {
  getActiveMembershipValidFromDate,
  isActiveMembership,
} from '~/utils/getMembershipYear';

describe('getMembershipYear', () => {
  test.each([
    [new Date('2026-05-31T12:00:00Z'), 2025],
    [new Date('2026-06-01T00:00:00Z'), 2026],
    [new Date('2026-07-15T12:00:00Z'), 2026],
    [new Date('2026-08-01T00:00:00Z'), 2026],
  ])('returns correct membership year for %s', (date, expectedYear) => {
    expect(getMembershipYear(date)).toBe(expectedYear);
  });
});

describe('getActiveMembershipValidFromDate', () => {
  test.each([
    [new Date('2026-07-15T12:00:00Z'), new Date('2025-06-01T00:00:00')],
    [new Date('2026-08-15T12:00:00Z'), new Date('2026-06-01T00:00:00')],
  ])(
    'returns correct validity window start for %s',
    (nowDate, expectedDate) => {
      expect(getActiveMembershipValidFromDate(nowDate)).toEqual(expectedDate);
    },
  );
});

describe('isActiveMembership', () => {
  test('returns true for purchases in the June/July early renewal window', () => {
    expect(
      isActiveMembership(
        new Date('2026-07-01T12:00:00Z'),
        new Date('2026-08-15T12:00:00Z'),
      ),
    ).toBe(true);
  });

  test('returns false when purchase is before valid-from date', () => {
    expect(
      isActiveMembership(
        new Date('2026-05-31T23:59:59Z'),
        new Date('2026-08-15T12:00:00Z'),
      ),
    ).toBe(false);
  });

  test('returns false for invalid purchase date strings', () => {
    expect(
      isActiveMembership('invalid date', new Date('2026-08-15T12:00:00Z')),
    ).toBe(false);
  });
});
