export class LuakUser {
  private readonly memberships: {
    membershipYear: number;
    paid: boolean;
  }[];
  private readonly isBoard: boolean;

  readonly authenticated: boolean;

  constructor(args: {
    memberships: {
      membershipYear: number;
      paid: boolean;
    }[];
    isBoard: boolean;
    authenticated: boolean;
  }) {
    this.memberships = args.memberships;
    this.isBoard = args.isBoard;
    this.authenticated = args.authenticated;
  }

  static UnauthenticatedUser = () =>
    new LuakUser({ memberships: [], isBoard: false, authenticated: false });

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

  get permissions() {
    return {
      authenticated: this.authenticated,
      memberSection:
        this.hasActiveMembership() || this.wasMemberLastYear() || this.isBoard,
      boardSection: this.isBoard,
    };
  }
}
