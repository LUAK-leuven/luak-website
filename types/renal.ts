import type { EntityId } from './ddd';
import type { Enums } from './database.types';
import type { GearItemId, TopoId } from './gear';
import type { UserId } from './user';

export type RentalId = EntityId<'rental'>;

export type UnsavedRental = {
  memberId?: UserId;
  boardMemberId: UserId;
  dateBorrow: string;
  dateReturn: string;
  gear: Record<GearItemId, number>;
  topos: Record<TopoId, number>;
  depositFee: number;
  paymentMethod: Enums<'payment_method'>;
  contactInfo?: ContactInfo;
  status: Enums<'rental_status'>;
  comments?: string;
};

export type ContactInfo = {
  fullName: string;
  email?: string;
  phoneNumber?: string;
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
