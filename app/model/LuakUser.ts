import { getCurrentMembershipYear, type Membership } from './Membership';

export class LuakUser {
  private readonly memberships: Membership[];
  private readonly isBoard: boolean;

  readonly authenticated: boolean;

  constructor(args: {
    memberships: Membership[];
    isBoard: boolean;
    authenticated: boolean;
  }) {
    this.memberships = args.memberships;
    this.isBoard = args.isBoard;
    this.authenticated = args.authenticated;
  }

  static UnauthenticatedUser = () =>
    new LuakUser({ memberships: [], isBoard: false, authenticated: false });

  readonly hasActiveMembership = () => {
    return this.memberships.some((membership) => membership.isActive());
  };

  readonly getActiveMembership = (): Membership | undefined => {
    return this.memberships.find((membership) => membership.isActive());
  };

  readonly wasMemberLastYear = () => {
    const currentYear = getCurrentMembershipYear();
    return this.memberships.some(
      (membership) => membership.membershipYear === currentYear - 1,
    );
  };

  readonly isFirstTimeMember = () => this.memberships.length === 0;

  get permissions() {
    return {
      authenticated: this.authenticated,
      memberSection:
        this.hasActiveMembership() || this.wasMemberLastYear() || this.isBoard,
      boardSection: this.isBoard,
    };
  }
}
