import type { GearItemId } from '#shared/api/rest/gear';
import type { TopoId } from '#shared/api/rest/topo';
import type {
  RentalId,
  OutstandingAmount,
  RentalMemberName,
} from '#shared/api/rest/rental';

export type RentedGearAmount = {
  gearItemId: GearItemId;
  rentedAmount: OutstandingAmount;
};

export type RentedTopoAmount = {
  topoId: TopoId;
  rentedAmount: OutstandingAmount;
};

export type RentalForItem = {
  id: RentalId;
  rentedAmount: OutstandingAmount;
  memberName: RentalMemberName;
};
