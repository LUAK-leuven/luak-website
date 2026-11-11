import type { DepositFee, RentalId } from '#shared/api/rest/rental';
import type { RentalItemId } from '#shared/api/rest/rental/rentalItem';
import type { UserId } from '#shared/api/rest/user';

export type PaymentMethod = 'cash' | 'transfer';

export type UnsavedRental = {
  boardMemberId: UserId;
  dateBorrow: string;
  dateReturn: string;
  depositFee: DepositFee;
  paymentMethod: PaymentMethod;
  comments: string | undefined;
  memberId: UserId | undefined;
  contactInfo: ContactInfo | undefined;
  gear: Partial<Record<RentalItemId, number>>;
  topos: Partial<Record<RentalItemId, number>>;
};

export type SavedRental = UnsavedRental & { id: RentalId };

export type RentalUpdate = {
  id: RentalId;
  dateReturn: string;
  gear: { id: RentalItemId; returned_amount: number }[];
  topos: { id: RentalItemId; returned_amount: number }[];
  depositReturned: boolean;
  comments: string | undefined;
};

export type ComputedRentalStatus =
  'returned' | 'partially_returned' | 'not_returned';
export type RentalStatus = ComputedRentalStatus | 'reserved';

export type ContactInfo = {
  fullName: string;
  email: string | undefined;
  phoneNumber: string | undefined;
};
