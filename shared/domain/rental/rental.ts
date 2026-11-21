import type { RentalId, RentalMemberName } from '#shared/api/rest/rental';
import type { OutstandingAmount } from '#shared/api/rest/rental/rentalItem';

export type RentalForItem = {
  id: RentalId;
  rentedAmount: OutstandingAmount;
  memberName: RentalMemberName;
};
