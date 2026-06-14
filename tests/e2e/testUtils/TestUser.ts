export class TestUser {
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly password: string;

  constructor(args: {
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
  }) {
    this.firstName = args.firstName;
    this.lastName = args.lastName;
    this.email = args.email;
    this.password = args.password ?? 'password';
  }

  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }
}

export const testUsers = {
  nonMember: new TestUser({
    firstName: 'Non',
    lastName: 'Member',
    email: 'non_member@test.com',
  }),
  unpaidMembership: new TestUser({
    firstName: 'Unpaid',
    lastName: 'Membership',
    email: 'unpaid_membership@test.com',
  }),
  paidLastYear: new TestUser({
    firstName: 'Paid',
    lastName: 'Last Year',
    email: 'paid_last_year@test.com',
    password: 'password',
  }),
  paidMembership: new TestUser({
    firstName: 'Paid',
    lastName: 'Membership',
    email: 'paid_this_year@test.com',
    password: 'password',
  }),
  boardMember: new TestUser({
    firstName: 'Board',
    lastName: 'Member',
    email: 'board_member@test.com',
    password: 'password',
  }),
} as const satisfies Record<string, TestUser>;

export type TestUserKey = keyof typeof testUsers;
