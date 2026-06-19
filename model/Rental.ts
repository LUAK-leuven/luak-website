import dayjs from 'dayjs';
import type { GearItemId, TopoId } from '~/types/gear';
import type { RentalId, RentalItemId, RentalStatus } from '~/types/rental';
import type { UserId } from '~/types/user';

abstract class RentalBase {
  readonly id: RentalId;
  readonly gear: RentalGearItem[];
  readonly topos: RentalTopoItem[];
  readonly dateReturn: string;
  readonly dateBorrow: string;
  readonly depositReturned: boolean;

  constructor(args: {
    id: RentalId;
    gear: RentalGearItem[];
    topos: RentalTopoItem[];
    dateReturn: string;
    dateBorrow: string;
    depositReturned: boolean;
  }) {
    this.id = args.id;
    this.gear = args.gear;
    this.topos = args.topos;
    this.dateReturn = args.dateReturn;
    this.dateBorrow = args.dateBorrow;
    this.depositReturned = args.depositReturned;
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

  readonly getItem = (itemId: RentalItemId): RentalItem => {
    if (itemId.type === 'gear') return this.getGearItem(itemId.id);
    else return this.getTopo(itemId.id);
  };

  readonly getGearItem = (gearItemId: GearItemId): RentalGearItem => {
    const item = this.gear.find(({ itemId }) => itemId.id === gearItemId);
    if (!item)
      throw showError(
        `Gear item with id ${gearItemId} not found in rental ${this.id}`,
      );
    return item;
  };

  readonly getTopo = (topoId: TopoId): RentalTopoItem => {
    const item = this.topos.find(({ itemId }) => itemId.id === topoId);
    if (!item)
      throw showError(`Topo with id ${topoId} not found in rental ${this.id}`);
    return item;
  };
}

export class RentalSummary extends RentalBase {
  readonly memberName: string;

  constructor(args: {
    id: RentalId;
    gear: RentalGearItem[];
    topos: RentalTopoItem[];
    memberName: string;
    dateReturn: string;
    dateBorrow: string;
    depositReturned: boolean;
  }) {
    super(args);
    this.memberName = args.memberName;
  }
}

export class RentalDetails extends RentalBase {
  readonly contactInfo: ContactInfo;
  readonly boardMember: string;
  readonly paymentMethod: PaymentMethod;
  readonly depositFee: number;
  readonly comments: string;
  readonly memberId: UserId | undefined;

  constructor(args: {
    id: RentalId;
    gear: RentalGearItem[];
    topos: RentalTopoItem[];
    contactInfo: ContactInfo;
    dateReturn: string;
    dateBorrow: string;
    depositReturned: boolean;
    boardMember: string;
    depositFee: number;
    paymentMethod: PaymentMethod;
    comments: string;
    memberId: UserId | undefined;
  }) {
    super(args);

    this.contactInfo = args.contactInfo;
    this.boardMember = args.boardMember;
    this.depositFee = args.depositFee;
    this.paymentMethod = args.paymentMethod;
    this.comments = args.comments;
    this.memberId = args.memberId;
  }

  readonly copy = (
    args: Partial<{
      id: RentalId;
      gear: RentalGearItem[];
      topos: RentalTopoItem[];
      contactInfo: ContactInfo;
      dateReturn: string;
      dateBorrow: string;
      depositReturned: boolean;
      boardMember: string;
      depositFee: number;
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

export abstract class RentalItem {
  abstract readonly itemId: RentalItemId;

  readonly name: string;
  readonly rentedAmount: number;
  readonly returnedAmount: number;
  readonly lostAmount: number;

  protected constructor(args: {
    name: string;
    rentedAmount: number;
    returnedAmount: number;
    lostAmount: number;
  }) {
    this.name = args.name;
    this.rentedAmount = args.rentedAmount;
    this.returnedAmount = args.returnedAmount;
    this.lostAmount = args.lostAmount;
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

  abstract readonly copy: (args: { returnedAmount?: number }) => RentalItem;
}

export class RentalGearItem extends RentalItem {
  override readonly itemId;

  constructor(args: {
    id: GearItemId;
    name: string;
    rentedAmount: number;
    returnedAmount: number;
    lostAmount: number;
  }) {
    super(args);
    this.itemId = { id: args.id, type: 'gear' as const };
  }

  override readonly copy = (args: Partial<{ returnedAmount: number }>) =>
    new RentalGearItem({
      id: this.itemId.id,
      name: this.name,
      rentedAmount: this.rentedAmount,
      returnedAmount: args.returnedAmount ?? this.returnedAmount,
      lostAmount: this.lostAmount,
    });
}

export class RentalTopoItem extends RentalItem {
  override readonly itemId;

  constructor(args: {
    id: TopoId;
    name: string;
    rentedAmount: number;
    returnedAmount: number;
    lostAmount: number;
  }) {
    super(args);
    this.itemId = { id: args.id, type: 'topo' as const };
  }

  override readonly copy = (args: { returnedAmount?: number }) =>
    new RentalTopoItem({
      id: this.itemId.id,
      name: this.name,
      rentedAmount: this.rentedAmount,
      returnedAmount:
        args.returnedAmount === undefined
          ? this.returnedAmount
          : args.returnedAmount,
      lostAmount: this.lostAmount,
    });
}

export class ContactInfo {
  constructor(
    readonly fullName: string,
    readonly email: string | undefined,
    readonly phoneNumber: string | undefined,
  ) {}
}

type PaymentMethod = 'cash' | 'transfer';
