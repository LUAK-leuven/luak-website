import type { RentalId } from '#shared/api/rest/rental';
import type { Dayjs } from 'dayjs';

export class Rental {
  readonly id: RentalId;
  readonly boardMemberId: UserId;
  readonly memberId: UserId | undefined;
  readonly dateBorrowed: Dayjs;
  readonly expectedReturnDate: Dayjs;
  readonly deposit: number;
  readonly depositReturned: boolean;
  readonly paymentMethod: PaymentMethod;
  readonly contactInfo: ContactInfo | undefined;
  readonly comments: string;

  constructor(args: {
    id: RentalId;
    boardMemberId: UserId;
    memberId: UserId | undefined;
    dateBorrowed: Dayjs;
    expectedReturnDate: Dayjs;
    deposit: number;
    depositReturned: boolean;
    paymentMethod: PaymentMethod;
    contactInfo: ContactInfo | undefined;
    comments: string;
  }) {
    this.id = args.id;
    this.boardMemberId = args.boardMemberId;
    this.memberId = args.memberId;
    this.dateBorrowed = args.dateBorrowed;
    this.expectedReturnDate = args.expectedReturnDate;
    this.deposit = args.deposit;
    this.depositReturned = args.depositReturned;
    this.paymentMethod = args.paymentMethod;
    this.contactInfo = args.contactInfo;
    this.comments = args.comments;
  }
}
