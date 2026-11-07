import type { AvailableAmount } from '#shared/api/rest/inventory';
import type { RentalItemTotalAmount } from '#shared/api/rest/rental';

export type RentalItem<T extends EntityId> = {
  id: T;
  name: string;
  totalAmount: RentalItemTotalAmount;
  availableAmount: AvailableAmount;
  depositFee: number;
};

export type ItemStatus = 'returned' | 'partially-returned' | 'not-returned';
