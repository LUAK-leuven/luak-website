import type { GearItemId } from '#shared/api/rest/gear';
import type { RentalItemId } from '#shared/api/rest/rental/rentalItem';
import type {
  RentalForItem,
  RentedTopoAmount,
} from '#shared/domain/rental/rental';

export interface RentalRepository {
  getRentedGearAmounts(): Promise<Partial<Record<GearItemId, number[]>>>;
  getRentedTopoAmounts(): Promise<RentedTopoAmount[]>;
  getRentalsFor(rentalItemId: RentalItemId): Promise<RentalForItem[]>;
}
