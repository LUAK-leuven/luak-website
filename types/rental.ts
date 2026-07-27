import type { EntityId } from './ddd';
import type { Enums } from './database.types';
import type { GearItemId, TopoId } from './gear';
import type { UserId } from './user';
import type { ContactInfo, RentalItem } from '~/model/Rental';

export type RentalId = EntityId<'rental'>;

type BaseRental = {
  id: RentalId;
  boardMemberId: UserId;
  dateBorrow: string;
  dateReturn: string;
  depositFee: number;
  paymentMethod: Enums<'payment_method'>;
  comments: string | undefined;
};

export type UnsavedRental = Omit<BaseRental, 'id'> & {
  memberId: UserId | undefined;
  contactInfo: ContactInfo | undefined;
  gear: Record<GearItemId, number>;
  topos: Record<TopoId, number>;
};

export type SavedRental = UnsavedRental & { id: RentalId };

export type RentalUpdate = {
  id: RentalId;
  dateReturn: string;
  gear: { gear_item_id: GearItemId; returned_amount: number }[];
  topos: { topo_id: TopoId; returned_amount: number }[];
  depositReturned: boolean;
  comments: string | undefined;
};

export type RentalDetails = PublicRentalDetails & {
  member: ContactInfo;
  memberId: UserId | undefined;
  boardMember: string;
  comments: string | undefined;
};

export type PublicRentalDetails = {
  id: RentalId;
  dateBorrow: string;
  dateReturn: string;
  depositFee: number;
  depositReturned: boolean;
  gear: RentalItem[];
  topos: RentalItem[];
  paymentMethod: Enums<'payment_method'>;
  status: RentalStatus;
};

export type RentalItemId =
  | {
      id: GearItemId;
      type: 'gear';
    }
  | {
      id: TopoId;
      type: 'topo';
    };

export type ComputedRentalStatus =
  | 'returned'
  | 'partially_returned'
  | 'not_returned';
export type RentalStatus = ComputedRentalStatus | 'reserved';
