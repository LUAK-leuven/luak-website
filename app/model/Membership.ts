import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { DomainValidationException } from './DomainValidationException';

export class Membership {
  private readonly createdOn: Dayjs;
  readonly membershipYear: number;

  constructor(args: { membershipYear: number; createdOn: Dayjs }) {
    this.membershipYear = args.membershipYear;
    this.createdOn = args.createdOn;

    this.validate();
  }

  static createNewMembership(date: Dayjs = dayjs()): Membership {
    const membershipYear = date.year();
    return new Membership({ membershipYear, createdOn: date });
  }

  isActive() {
    const now = dayjs();
    if (now.isBefore(this.createdOn, 'day')) return false;
    return _isValidForMembershipYear({
      date: now,
      membershipYear: this.membershipYear,
    });
  }

  private validate() {
    if (_getMembershipYearForDate(this.createdOn) !== this.membershipYear) {
      throw new DomainValidationException(
        `Invalid Membership(${this.membershipYear.toFixed()}, ${this.createdOn.format('YYYY-MM-DD')})`,
      );
    }
  }
}

const MEMBERSHIP_START_DATE = '07-01'; // July 1st
const MEMBERSHIP_END_DATE = '08-31'; // August 31st

const membershipStartDate = (membershipYear: number) =>
  dayjs(`${membershipYear.toFixed()}-${MEMBERSHIP_START_DATE}`);

const membershipEndDate = (membershipYear: number) =>
  dayjs(`${(membershipYear + 1).toFixed()}-${MEMBERSHIP_END_DATE}`);

export const _isValidForMembershipYear = (args: {
  date: Dayjs;
  membershipYear: number;
}): boolean => {
  return (
    !args.date.isBefore(membershipStartDate(args.membershipYear), 'day') &&
    !args.date.isAfter(membershipEndDate(args.membershipYear), 'day')
  );
};

export const _getMembershipYearForDate = (date: Dayjs): number => {
  const currentYear = date.year();
  if (
    date.isBefore(
      dayjs(`${currentYear.toFixed()}-${MEMBERSHIP_START_DATE}`),
      'day',
    )
  )
    return currentYear - 1;
  else return currentYear;
};
