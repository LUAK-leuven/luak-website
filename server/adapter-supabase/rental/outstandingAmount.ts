import {
  createOutstandingAmount,
  type OutstandingAmount,
} from '#shared/api/rest/rental/rentalItem';
import type { Database } from '#shared/types/database.types';

type RentedItemRow = Database['public']['Tables']['RentedItems']['Row'];

export const outstandingAmountOf = (
  rentedItem: Pick<
    RentedItemRow,
    'rented_amount' | 'returned_amount' | 'lost_amount'
  >,
): OutstandingAmount =>
  createOutstandingAmount(
    rentedItem.rented_amount -
      rentedItem.returned_amount -
      rentedItem.lost_amount,
  );
