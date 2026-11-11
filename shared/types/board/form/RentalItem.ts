import type { AvailableAmount } from '#shared/api/rest/inventory';
import type { DepositFee } from '#shared/api/rest/rental';
import type {
  RentalItemId,
  RentalItemName,
  TotalAmount,
} from '#shared/api/rest/rental/rentalItem';

export type RentalItem = {
  id: RentalItemId;
  name: RentalItemName;
  totalAmount: TotalAmount;
  availableAmount: AvailableAmount;
  depositFee: DepositFee;
};

export type ItemStatus = 'returned' | 'partially-returned' | 'not-returned';
