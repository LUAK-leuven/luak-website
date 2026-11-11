import dayjs from 'dayjs';

import type {
  DepositFee,
  RentalId,
  RentalItemId,
} from '#shared/api/rest/rental';
import type { UserId } from '#shared/api/rest/user';
import { DomainValidationException } from '~/model/DomainValidationException';

abstract class RentalBase {
  readonly id: RentalId;
  readonly gear: RentalItem[];
  readonly topos: RentalItem[];
  readonly dateReturn: string;
  readonly dateBorrow: string;
  readonly depositReturned: boolean;
  readonly depositFee: DepositFee;

  constructor(args: {
    id: RentalId;
    gear: RentalItem[];
    topos: RentalItem[];
    dateReturn: string;
    dateBorrow: string;
    depositReturned: boolean;
    depositFee: DepositFee;
  }) {
    this.id = args.id;
    this.gear = args.gear;
    this.topos = args.topos;
    this.dateReturn = args.dateReturn;
    this.dateBorrow = args.dateBorrow;
    this.depositReturned = args.depositReturned;
    this.depositFee = args.depositFee;

    this.validate();
  }

  get status(): RentalStatus {
    if (this.isReserved()) return 'reserved';
    let isAllReturned = true;
    let isAnyReturned = false;
    for (const item of this.items) {
      switch (item.getStatus()) {
        case 'fullyReturned':
          isAnyReturned = true;
          break;
        case 'invalid':
          break;
        case 'partiallyReturned':
          isAnyReturned = true;
          isAllReturned = false;
          break;
        case 'notReturned':
          isAllReturned = false;
      }
      if (!item.isFullyReturned) isAllReturned = false;
    }

    if (this.depositReturned && isAllReturned) return 'returned';
    if (this.depositReturned || isAnyReturned) return 'partially_returned';
    return 'not_returned';
  }

  private readonly isReserved = (): boolean =>
    dayjs(this.dateBorrow).isAfter(dayjs());

  get items(): RentalItem[] {
    return [...this.gear, ...this.topos];
  }

  readonly getItem = (rentalItemId: RentalItemId): RentalItem => {
    const item = this.gear
      .concat(this.topos) // Fix?
      .find(({ id }) => id === rentalItemId);
    if (!item)
      throw new Error(
        `Rental item with id ${rentalItemId} not found in rental ${this.id}`,
      );
    return item;
  };

  readonly getGearItem = (gearItemId: RentalItemId): RentalItem => {
    const item = this.gear.find(({ id }) => id === gearItemId);
    if (!item)
      throw new Error(
        `Gear item with id ${gearItemId} not found in rental ${this.id}`,
      );
    return item;
  };

  readonly getTopo = (topoId: RentalItemId): RentalItem => {
    const item = this.topos.find(({ id }) => id === topoId);
    if (!item)
      throw new Error(`Topo with id ${topoId} not found in rental ${this.id}`);
    return item;
  };

  private readonly validate = () => {
    if (this.depositFee < 0)
      throw new DomainValidationException('Deposit fee cannot be negative');
  };
}

export class RentalSummary extends RentalBase {
  readonly memberName: string;

  constructor(args: {
    id: RentalId;
    gear: RentalItem[];
    topos: RentalItem[];
    memberName: string;
    dateReturn: string;
    dateBorrow: string;
    depositReturned: boolean;
    depositFee: DepositFee;
  }) {
    super(args);
    this.memberName = args.memberName;
  }
}

export class PublicRentalDetails extends RentalBase {
  readonly paymentMethod: PaymentMethod;

  constructor(args: {
    id: RentalId;
    gear: RentalItem[];
    topos: RentalItem[];
    dateBorrow: string;
    dateReturn: string;
    depositFee: DepositFee;
    depositReturned: boolean;
    paymentMethod: PaymentMethod;
  }) {
    super(args);
    this.paymentMethod = args.paymentMethod;
  }
}

export class RentalDetails extends RentalBase {
  readonly contactInfo: ContactInfo;
  readonly boardMember: string;
  readonly paymentMethod: PaymentMethod;
  readonly comments: string;
  readonly memberId: UserId | undefined;

  constructor(args: {
    id: RentalId;
    gear: RentalItem[];
    topos: RentalItem[];
    contactInfo: ContactInfo;
    dateReturn: string;
    dateBorrow: string;
    depositReturned: boolean;
    boardMember: string;
    depositFee: DepositFee;
    paymentMethod: PaymentMethod;
    comments: string;
    memberId: UserId | undefined;
  }) {
    super(args);

    this.contactInfo = args.contactInfo;
    this.boardMember = args.boardMember;
    this.paymentMethod = args.paymentMethod;
    this.comments = args.comments;
    this.memberId = args.memberId;
  }

  readonly copy = (
    args: Partial<{
      id: RentalId;
      gear: RentalItem[];
      topos: RentalItem[];
      contactInfo: ContactInfo;
      dateReturn: string;
      dateBorrow: string;
      depositReturned: boolean;
      boardMember: string;
      depositFee: DepositFee;
      paymentMethod?: PaymentMethod;
      comments: string;
      memberId: UserId | undefined;
    }>,
  ) =>
    new RentalDetails({
      id: args.id ?? this.id,
      gear: args.gear ?? this.gear,
      topos: args.topos ?? this.topos,
      contactInfo: args.contactInfo ?? this.contactInfo,
      dateReturn: args.dateReturn ?? this.dateReturn,
      dateBorrow: args.dateBorrow ?? this.dateBorrow,
      depositReturned: args.depositReturned ?? this.depositReturned,
      boardMember: args.boardMember ?? this.boardMember,
      depositFee: args.depositFee ?? this.depositFee,
      paymentMethod: args.paymentMethod ?? this.paymentMethod,
      comments: args.comments ?? this.comments,
      memberId: args.memberId ?? this.memberId,
    });
}

export class RentalItem {
  readonly id: RentalItemId;
  readonly name: string;
  readonly rentedAmount: number;
  readonly returnedAmount: number;
  readonly lostAmount: number;
  readonly type: RentalItemType;

  constructor(args: {
    id: RentalItemId;
    name: string;
    rentedAmount: number;
    returnedAmount: number;
    lostAmount: number;
    type: RentalItemType;
  }) {
    this.id = args.id;
    this.name = args.name;
    this.rentedAmount = args.rentedAmount;
    this.returnedAmount = args.returnedAmount;
    this.lostAmount = args.lostAmount;
    this.type = args.type;
  }

  readonly isValid = () => {
    if (this.rentedAmount < 0 || this.returnedAmount < 0 || this.lostAmount < 0)
      return false;
    if (this.returnedAmount + this.lostAmount > this.rentedAmount) return false;
    return true;
  };

  get unreturnedAmount(): number {
    return this.rentedAmount - this.returnedAmount - this.lostAmount;
  }

  get returnableAmount(): number {
    return this.rentedAmount - this.lostAmount;
  }

  get isFullyReturned(): boolean {
    return this.unreturnedAmount === 0;
  }

  readonly getStatus = () => {
    if (!this.isValid()) return 'invalid';
    if (this.isFullyReturned) return 'fullyReturned';
    if (this.returnedAmount === 0) return 'notReturned';
    if (this.unreturnedAmount > 0) return 'partiallyReturned';
    return 'invalid';
  };

  readonly copy = (
    args: Partial<ConstructorParameters<typeof RentalItem>[0]>,
  ): RentalItem => {
    return new RentalItem({
      id: args.id ?? this.id,
      name: args.name ?? this.name,
      rentedAmount: args.rentedAmount ?? this.rentedAmount,
      returnedAmount: args.returnedAmount ?? this.returnedAmount,
      lostAmount: args.lostAmount ?? this.lostAmount,
      type: args.type ?? this.type,
    });
  };
}

export type RentalItemType = 'gear' | 'topo';
