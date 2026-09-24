export type RentalId = EntityId<'rental'>;

export type RentalSummary = {
  id: RentalId;
  memberName: string;
  dateBorrow: string;
  expectedReturnDate: string;
  status: RentalStatus;
};

export type RentalStatus =
  'returned' | 'partially_returned' | 'not_returned' | 'reserved';
