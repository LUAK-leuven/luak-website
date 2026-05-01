import type { EntityId } from './ddd';
import type { Enums } from './database.types';
import type { GearItemId, TopoId } from './gear';
import type { UserId } from './user';

export type RentalId = EntityId<'rental'>;

type BaseRental = {
  id: RentalId;
  boardMemberId: UserId;
  dateBorrow: string;
  dateReturn: string;
  depositFee: number;
  paymentMethod: Enums<'payment_method'>;
  status: Enums<'rental_status'>;
  comments?: string;
};

export type UnsavedRental = Omit<BaseRental, 'id'> & {
  memberId: UserId | undefined;
  contactInfo: ContactInfo | undefined;
  gear: Record<GearItemId, number>;
  topos: Record<TopoId, number>;
};

export type SavedRental = UnsavedRental & { id: RentalId };

export type ContactInfo = {
  fullName: string;
  email: string | undefined;
  phoneNumber: string | undefined;
};

export type RentalUpdate = {
  id: RentalId;
  dateReturn: string;
  gear: { gear_item_id: GearItemId; returned_amount: number }[];
  topos: { topo_id: TopoId; returned_amount: number }[];
  depositReturned: boolean;
  status: Enums<'rental_status'>;
  comments: string | undefined;
};

export type RentalDetails = {
  id: RentalId;
  member: ContactInfo;
  memberId: UserId | undefined;
  boardMember: string;
  dateBorrow: string;
  dateReturn: string;
  depositFee: number;
  depositReturned: boolean;
  gear: {
    id: GearItemId;
    name: string;
    rentedAmount: number;
    returnedAmount: number;
  }[];
  topos: {
    id: TopoId;
    title: string;
    rentedAmount: number;
    returnedAmount: number;
  }[];
  paymentMethod: Enums<'payment_method'>;
  status: Enums<'rental_status'>;
  comments: string | undefined;
};
