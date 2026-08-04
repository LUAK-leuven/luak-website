import dayjs, { type Dayjs } from 'dayjs';
import { expect, test } from 'vitest';
import { Membership, isValidForMembershipYear } from '~/app/model/Membership';
import { DomainValidationException } from '~/app/model/DomainValidationException';

test.each([
  [2023, dayjs('2023-06-30'), false], // Valid 01-07-2023 to 31-08-2024
  [2025, dayjs('2025-07-01'), true], // Valid 01-07-2025 to 31-08-2026
  [1980, dayjs('1981-08-31'), true], // Valid 01-07-1980 to 31-08-1981
  [2013, dayjs('2014-09-01'), false], // Valid 01-07-2013 to 31-08-2014
])(
  'isValidForMembershipYear',
  (membershipYear: number, now: Dayjs, isValid: boolean) => {
    expect(isValidForMembershipYear({ date: now, membershipYear })).toBe(
      isValid,
    );
  },
);

test('isActive - A membership is only active from the moment it is created', () => {
  const membership = new Membership({
    membershipYear: dayjs().year(),
    createdOn: dayjs().add(1, 'day'),
  });

  expect(membership.isActive()).toBe(false);
  expect(membership.isActive()).toBe(true);
});

test.each([
  [2024, '2024-06-30'], // Valid 01-07-2024 to 31-08-2025
  [2024, '2025-09-01'], // Valid 01-07-2024 to 31-08-2025
  [2024, '2025-07-01'], // But created on 01-07-2025 should correspond to membership year 2025
])(
  'A membership creation date must be valid for the membership year',
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
