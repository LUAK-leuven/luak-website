export class Membership {
  constructor(
    private readonly memberships: {
      membershipYear: number;
      paid: boolean;
    }[],
  ) {}

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

  readonly isFirstTimeMember = () => this.memberships.length === 0;

  readonly getMembershipStatus = (luakYear: number = getLuakYear()) => {
    const membership = findBy(this.memberships, 'membershipYear', luakYear);
    if (membership === undefined) return 'no_membership';
    if (membership.paid) return 'paid_membership';
    return 'unpaid_membership';
  };
}
