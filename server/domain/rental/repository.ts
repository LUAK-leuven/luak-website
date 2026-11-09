import type { TopoId } from '#shared/api/rest/topo';
import type {
  RentedTopoAmount,
  RentalForItem,
} from '#server/domain/rental/rental';
import type { RentalItemId } from '#shared/api/rest/rental';
import type { GearItemId } from '#shared/api/rest/gear';

export interface RentalRepository {
  getRentedGearAmounts(): Promise<Partial<Record<GearItemId, number[]>>>;
  getRentedTopoAmounts(): Promise<RentedTopoAmount[]>;
  getRentalsFor(rentalItemId: RentalItemId): Promise<RentalForItem[]>;
  getRentalsForTopo(topoId: TopoId): Promise<RentalForItem[]>;
}
