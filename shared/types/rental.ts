export type RentalId = EntityId<'rental'>;

export type PaymentMethod = Enums<'payment_method'>;

export type UnsavedRental = {
  boardMemberId: UserId;
  dateBorrow: string;
  dateReturn: string;
  depositFee: number;
  paymentMethod: PaymentMethod;
  comments: string | undefined;
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
  'returned' | 'partially_returned' | 'not_returned';
export type RentalStatus = ComputedRentalStatus | 'reserved';

export type ContactInfo = {
  fullName: string;
  email: string | undefined;
  phoneNumber: string | undefined;
};
