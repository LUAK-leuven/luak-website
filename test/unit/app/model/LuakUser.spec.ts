import dayjs from 'dayjs';
import { expect, test } from 'vitest';
import { DomainValidationException } from '~/model/DomainValidationException';
import { LuakUser } from '~/model/LuakUser';
import { Membership } from '~/model/Membership';
import { randomBool } from '#shared/utils/utils';
import { withFakeTimers } from '#test/vitest/withFakeTimers';

test('create - throws exception when has memberships and is unauthenticated', () => {
  expect(
    () =>
      new LuakUser({
        memberships: [Membership.createNewMembership()],
        isBoard: false,
        authenticated: false,
      }),
  ).toThrow(DomainValidationException);
});

test('create - throws exception when isBoard and is unauthenticated', () => {
  expect(
    () =>
      new LuakUser({
        memberships: [],
        isBoard: true,
        authenticated: false,
      }),
  ).toThrow(DomainValidationException);
});

test('create - can create a valid LuakUser', () => {
  expect(() => aLuakUser()).not.toThrow();
});

test('getActiveMembership - returns the most recent active membership', () => {
  withFakeTimers(({ setTime }) => {
    setTime('2026-08-20');

    const membership1 = new Membership({
      membershipYear: 2025,
      createdOn: dayjs('2025-09-23'),
    });
    const membership2 = new Membership({
      membershipYear: 2026,
      createdOn: dayjs('2026-07-30'),
    });
    expect(membership1.isActive()).toBe(true);
    expect(membership2.isActive()).toBe(true);

    const luakUser = aLuakUser({
      memberships: [membership1, membership2],
    });

    expect(luakUser.getActiveMembership()).toBe(membership2);
  });
});

type LuakUserArgs = ConstructorParameters<typeof LuakUser>[0];

const aLuakUser = (args: Partial<LuakUserArgs> = {}): LuakUser => {
  const authenticated =
    args.authenticated === undefined
      ? (args.memberships === undefined || args.memberships.length === 0) &&
        (args.isBoard === undefined || !args.isBoard)
        ? randomBool()
        : true
      : args.authenticated;
  const memberships =
    args.memberships === undefined
      ? authenticated
        ? [Membership.createNewMembership()]
        : []
      : args.memberships;
  const isBoard =
    args.isBoard === undefined
      ? authenticated
        ? randomBool()
        : false
      : args.isBoard;

  return new LuakUser({ memberships, isBoard, authenticated });
};
