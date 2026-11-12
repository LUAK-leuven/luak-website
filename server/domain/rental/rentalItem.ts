import type { GearItemId } from '#shared/api/rest/gear';
import type { DepositFee } from '#shared/api/rest/rental';
import type { RentalItemWithAvailability } from '#shared/api/rest/rental/availability';
import type { RentalItemName } from '#shared/api/rest/rental/rentalItem';

export interface RentalItemRepository {
  getAllRentalGearItems(): Promise<RentalItem[]>;
  getAllRentalTopoItems(): Promise<RentalItemWithAvailability[]>;
}

export type RentalItem = {
  id: GearItemId;
  name: RentalItemName;
  depositFee: DepositFee;
};
