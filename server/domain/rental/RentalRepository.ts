import type { Rental } from '#server/domain/rental/Rental';

export interface RentalRepository {
  getRentals(): Promise<Rental[]>;
}
