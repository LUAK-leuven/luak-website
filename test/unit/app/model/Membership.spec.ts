import dayjs from 'dayjs';
import { expect, test } from 'vitest';
import {
  Membership,
  _getMembershipYearForDate,
  _isValidForMembershipYear,
} from '~/app/model/Membership';
import { DomainValidationException } from '~/app/model/DomainValidationException';

test.each([
  [2023, '2023-06-30', false], // Valid 01-07-2023 to 31-08-2024
  [2025, '2025-07-01', true], // Valid 01-07-2025 to 31-08-2026
  [1980, '1981-08-31', true], // Valid 01-07-1980 to 31-08-1981
  [2013, '2014-09-01', false], // Valid 01-07-2013 to 31-08-2014
])(
  'isValidForMembershipYear(%i, %s) -> %s',
  (membershipYear: number, now: string, isValid: boolean) => {
    expect(
      _isValidForMembershipYear({ date: dayjs(now), membershipYear }),
    ).toBe(isValid);
  },
);

test.each([
  [1, false], // Created tomorrow, not active yet
  [0, true], // Created today, active
  [-1, true], // Created yesterday, active
])(
  'isActive - A membership is only active after it is created (%i -> %s)',
  (deltaCreatedOn: number, isActive: boolean) => {
    const membership = new Membership({
      membershipYear: dayjs().year(),
      createdOn: dayjs().add(deltaCreatedOn, 'day'),
    });

    expect(membership.isActive()).toBe(isActive);
  },
);

test.each([
  [2024, '2024-06-30'], // Valid 01-07-2024 to 31-08-2025
  [2024, '2025-09-01'], // Valid 01-07-2024 to 31-08-2025
  [2024, '2025-07-01'], // But created on 01-07-2025 should correspond to membership year 2025
])(
  'A membership creation date must be valid for the membership year (%i, %s)',
  (membershipYear: number, createdOn: string) => {
    expect(() => {
      new Membership({
        membershipYear,
        createdOn: dayjs(createdOn),
      });
    }).toThrow(DomainValidationException);
  },
);

test.each([
  [2024, '2024-07-01'], // Valid 01-07-2024 to 31-08-2025
  [2024, '2025-06-30'], // Valid 01-07-2024 to 31-08-2025, but created after 01-07-2025 should correspond to membership year 2025
])(
  'Can create a valid Membership',
  (membershipYear: number, createdOn: string) => {
    expect(() => {
      new Membership({
        membershipYear: membershipYear,
        createdOn: dayjs(createdOn),
      });
    }).not.toThrow();
  },
);

test.each([
  ['2023-06-30', 2022],
  ['2023-07-01', 2023],
  ['2024-06-30', 2023],
  ['2024-07-01', 2024],
])(
  '_getMembershipYearForDate(%s) -> %i',
  (date: string, expectedMembershipYear: number) => {
    expect(_getMembershipYearForDate(dayjs(date))).toBe(expectedMembershipYear);
  },
);
