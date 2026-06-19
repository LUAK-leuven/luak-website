import { object as zodObject, string as zodString } from 'zod';
import type { infer as Infer } from 'zod';
import type { RentalItemId } from '~/types/rental';

const contactInfoSchema = zodObject({
  fullName: zodString().nonempty(),
  email: zodString().nonempty().optional(),
  phoneNumber: zodString().nonempty().optional(),
});

export type ContactInfo = Infer<typeof contactInfoSchema>;

export const parseContactInfo = (data: unknown): ContactInfo => {
  return contactInfoSchema.parse(data);
};

export class RentalItem {
  readonly itemId: RentalItemId;
  readonly name: string;
  readonly rentedAmount: number;
  readonly returnedAmount: number;
  readonly lostAmount: number;

  constructor(args: {
    itemId: RentalItemId;
    name: string;
    rentedAmount: number;
    returnedAmount: number;
    lostAmount: number;
  }) {
    this.itemId = args.itemId;
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
    if (this.unreturnedAmount > 0) return 'partiallyReturned';
    if (this.returnedAmount === 0) return 'notReturned';
    return 'invalid';
  };
}
