import type { GearItemId } from '#shared/api/rest/gear';
import type { TopoId } from '#shared/api/rest/topo';
import type { RentalId } from '#shared/types/rental';

export type RentedGearAmount = {
  gearItemId: GearItemId;
  rentedAmount: number;
};

export type RentedTopoAmount = {
  topoId: TopoId;
  rentedAmount: number;
};

export type RentalForItem = {
  id: RentalId;
  rentedAmount: number;
  memberName: string;
};
