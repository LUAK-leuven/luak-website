import type { AvailableAmount } from '#shared/api/rest/inventory';
import type { DepositFee, TotalAmount } from '#shared/api/rest/rental';

export type RentalItem<T extends EntityId> = {
  id: T;
  name: string;
  totalAmount: TotalAmount;
  availableAmount: AvailableAmount;
  depositFee: DepositFee;
};

export type ItemStatus = 'returned' | 'partially-returned' | 'not-returned';
