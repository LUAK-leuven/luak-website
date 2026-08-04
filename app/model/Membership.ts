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

  private validate() {
    if (
      !isValidForMembershipYear({
        membershipYear: this.membershipYear,
        date: this.createdOn,
      })
    ) {
      throw new DomainValidationException(
        `Invalid Membership(${this.membershipYear.toFixed()}, ${this.createdOn.format('YYYY-MM-DD')})`,
      );
    }
  }

  isActive() {
    const now = dayjs();
    if (now.isBefore(this.createdOn, 'day')) return false;
    return isValidForMembershipYear({
      date: this.createdOn,
      membershipYear: this.membershipYear,
    });
  }
}

const membershipStartDate = (membershipYear: number) =>
  dayjs(`${membershipYear.toFixed()}-07-01`);

const membershipEndDate = (membershipYear: number) =>
  dayjs(`${(membershipYear + 1).toFixed()}-08-31`);

export const isValidForMembershipYear = (args: {
  date: Dayjs;
  membershipYear: number;
}): boolean => {
  return (
    !args.date.isBefore(membershipStartDate(args.membershipYear), 'day') &&
    !args.date.isAfter(membershipEndDate(args.membershipYear), 'day')
  );
};
