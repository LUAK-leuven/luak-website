import type { TopoId } from '#shared/api/rest/topo';
import type {
  RentalId,
  OutstandingAmount,
  RentalMemberName,
  RentalItemId,
} from '#shared/api/rest/rental';

export type RentedTopoAmount = {
  topoId: TopoId;
  rentalItemId: RentalItemId;
  rentedAmount: OutstandingAmount;
};

export type RentalForItem = {
  id: RentalId;
  rentedAmount: OutstandingAmount;
  memberName: RentalMemberName;
};
