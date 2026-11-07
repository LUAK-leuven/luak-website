import type { AvailableAmount, TotalAmount } from '#shared/api/rest/inventory';

export type RentalItem<T extends EntityId> = {
  id: T;
  name: string;
  totalAmount: TotalAmount;
  availableAmount: AvailableAmount;
  depositFee: number;
};

export type ItemStatus = 'returned' | 'partially-returned' | 'not-returned';
