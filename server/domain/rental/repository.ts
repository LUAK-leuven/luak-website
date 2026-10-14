import type { GearItemId } from '#shared/api/rest/gear';
import type { TopoId } from '#shared/api/rest/topo';
import type {
  RentedGearAmount,
  RentedTopoAmount,
  RentalForItem,
} from '#server/domain/rental/rental';

export interface RentalRepository {
  getRentedGearAmounts(): Promise<RentedGearAmount[]>;
  getRentedTopoAmounts(): Promise<RentedTopoAmount[]>;
  getRentalsFor(gearItemId: GearItemId): Promise<RentalForItem[]>;
  getRentalsForTopo(topoId: TopoId): Promise<RentalForItem[]>;
}
