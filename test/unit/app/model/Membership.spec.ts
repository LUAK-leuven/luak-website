import dayjs from 'dayjs';
import { expect, test, vi } from 'vitest';
import { DomainValidationException } from '~/app/model/DomainValidationException';
import {
  Membership,
  _getMembershipYearForDate,
  _isValidForMembershipYear,
} from '~/app/model/Membership';

test.for([
  [2023, '2023-06-30', false], // Valid 01-07-2023 to 31-08-2024
  [2025, '2025-07-01', true], // Valid 01-07-2025 to 31-08-2026
  [1980, '1981-08-31', true], // Valid 01-07-1980 to 31-08-1981
  [2013, '2014-09-01', false], // Valid 01-07-2013 to 31-08-2014
] satisfies [number, string, boolean][])(
  'isValidForMembershipYear(%i, %s) -> %s',
  ([membershipYear, now, isValid]) => {
    expect(
      _isValidForMembershipYear({ date: dayjs(now), membershipYear }),
    ).toBe(isValid);
  },
);

test.for([
  {
    membershipYear: 2023, // Valid 01-07-2023 to 31-08-2024
    createdOn: '2023-07-03',
    now: '2023-06-30',
    isActive: false, // Now is before valid membership period
  },
  {
    membershipYear: 2025, // Valid 01-07-2025 to 31-08-2026
    createdOn: '2025-07-01',
    now: '2025-07-01',
    isActive: true, // Now is start of valid membership period
  },
  {
    membershipYear: 2025, // Valid 01-07-2025 to 31-08-2026
    createdOn: '2025-08-04',
    now: '2025-07-01',
    isActive: false, // Now in valid membership period, but before createdOn
  },
  {
    membershipYear: 1980, // Valid 01-07-1980 to 31-08-1981
    createdOn: '1980-11-25',
    now: '1981-08-31',
    isActive: true, // Now is end of valid membership period
  },
  {
    membershipYear: 2013, // Valid 01-07-2013 to 31-08-2014
    createdOn: '2014-06-30', // Should throw error
    now: '2014-09-01',
    isActive: false, // Now is after valid membership period
  },
])(
  'isActive - A membership is only active after it is created - %$',
  (args: {
    membershipYear: number;
    createdOn: string;
    now: string;
    isActive: boolean;
  }) => {
    withFakeTimers((setTime) => {
      setTime(args.now);

      const membership = new Membership({
        membershipYear: args.membershipYear,
        createdOn: dayjs(args.createdOn),
      });

      expect(membership.isActive()).toBe(args.isActive);
    });
  },
);

test.for([
  [2024, '2024-06-30'], // Valid 01-07-2024 to 31-08-2025
  [2024, '2025-09-01'], // Valid 01-07-2024 to 31-08-2025
  [2024, '2025-07-01'], // But created on 01-07-2025 should correspond to membership year 2025
] satisfies [number, string][])(
  'A membership creation date must be valid for the membership year (%i, %s)',
  ([membershipYear, createdOn]) => {
    expect(() => {
      new Membership({
        membershipYear,
        createdOn: dayjs(createdOn),
      });
    }).toThrow(DomainValidationException);
  },
);

test.for([
  [2024, '2024-07-01'], // Valid 01-07-2024 to 31-08-2025
  [2024, '2025-06-30'], // Valid 01-07-2024 to 31-08-2025, but created after 01-07-2025 should correspond to membership year 2025
] satisfies [number, string][])(
  'Can create a valid Membership',
  ([membershipYear, createdOn]) => {
    expect(() => {
      new Membership({
        membershipYear: membershipYear,
        createdOn: dayjs(createdOn),
      });
    }).not.toThrow();
  },
);

test.for([
  ['2023-06-30', 2022],
  ['2023-07-01', 2023],
  ['2024-06-30', 2023],
  ['2024-07-01', 2024],
] satisfies [string, number][])(
  '_getMembershipYearForDate(%s) -> %i',
  ([date, expectedMembershipYear]) => {
    expect(_getMembershipYearForDate(dayjs(date))).toBe(expectedMembershipYear);
  },
);

test.for([
  { now: '2004-06-30', expectedMembershipYear: 2003 },
  { now: '2004-07-01', expectedMembershipYear: 2004 },
])(
  'createNewMembership - creates a new membership for the correct membershipYear (%s) -> %i',
  (args: { now: string; expectedMembershipYear: number }) => {
    withFakeTimers((setTime) => {
      setTime(args.now);

      const membership = Membership.createNewMembership();
      expect(membership.membershipYear).toBe(args.expectedMembershipYear);
      expect(membership.isActive()).toBe(true);
    });
  },
);

const withFakeTimers = (
  fn: (setTime: (time: string | Date) => void) => void,
) => {
  vi.useFakeTimers();
  fn(vi.setSystemTime);
  vi.useRealTimers();
};
