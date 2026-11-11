import type {
  RentalForItem,
  RentedTopoAmount,
} from '#server/domain/rental/rental';
import type { GearItemId } from '#shared/api/rest/gear';
import type { RentalItemId } from '#shared/api/rest/rental';
import type { TopoId } from '#shared/api/rest/topo';

export interface RentalRepository {
  getRentedGearAmounts(): Promise<Partial<Record<GearItemId, number[]>>>;
  getRentedTopoAmounts(): Promise<RentedTopoAmount[]>;
  getRentalsFor(rentalItemId: RentalItemId): Promise<RentalForItem[]>;
  getRentalsForTopo(topoId: TopoId): Promise<RentalForItem[]>;
}
