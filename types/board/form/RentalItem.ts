import type { EntityId } from '~/types/common';

export type RentalItem<T extends EntityId<unknown>> = {
  id: T;
  name: string;
  totalAmount: number;
  availableAmount: number;
  depositFee: number;
};
