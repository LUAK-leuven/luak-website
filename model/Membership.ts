export class Membership {
  constructor(
    private readonly memberships: {
      membershipYear: number;
      paid: boolean;
    }[],
  ) {}

  private get paidMemberships() {
    return this.memberships
      .filter(({ paid }) => paid)
      .map(({ membershipYear }) => membershipYear);
  }

  readonly hasActiveMembership = (luakYear: number = getLuakYear()) => {
    return findBy(this.memberships, 'membershipYear', luakYear)?.paid ?? false;
  };

  readonly wasMemberLastYear = () => {
    const currentYear = getLuakYear();
    return (
      !this.hasActiveMembership(currentYear) &&
      this.hasActiveMembership(currentYear - 1)
    );
  };

  readonly isFirstTimeMember = () => this.paidMemberships.length === 0;
}
