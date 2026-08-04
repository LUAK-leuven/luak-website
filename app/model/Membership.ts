import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

export class Membership {
  private readonly createdOn: Dayjs;
  readonly membershipYear: number;

  private static readonly membershipStartDate = (membershipYear: number) =>
    dayjs(`${membershipYear.toFixed()}-07-01`);
  private static readonly membershipEndDate = (membershipYear: number) =>
    dayjs(`${(membershipYear + 1).toFixed()}-08-31`);

  constructor(args: { membershipYear: number; createdOn: Dayjs }) {
    this.membershipYear = args.membershipYear;
    this.createdOn = args.createdOn;
  }

  isActive() {
    return isValidForMembershipYear({
      date: this.createdOn,
      membershipYear: this.membershipYear,
    });
  }
}

export const isValidForMembershipYear = (args: {
  date: Dayjs;
  membershipYear: number;
}): boolean => {
  return false; // TODO: Implement logic to determine if the date is valid for the membership year
};
