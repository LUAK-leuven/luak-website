import type { RentalItemId } from '#shared/api/rest/rental/rentalItem';
import type { RentalForItem } from '#shared/domain/rental/rental';

export interface RentalRepository {
  getRentalsFor(rentalItemId: RentalItemId): Promise<RentalForItem[]>;
}
