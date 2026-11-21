import type { DepositFee } from '#shared/api/rest/rental';
import type { RentalItemWithAvailability } from '#shared/api/rest/rental/availability';
import type {
  RentalItemId,
  RentalItemName,
} from '#shared/api/rest/rental/rentalItem';

export interface RentalItemRepository {
  getAllRentalGearItems(): Promise<RentalItemWithAvailability[]>;
  getAllRentalTopoItems(): Promise<RentalItemWithAvailability[]>;
}

export type RentalItem<T extends RentalItemId = RentalItemId> = {
  id: T;
  name: RentalItemName;
  depositFee: DepositFee;
};
