import type { RentalId, RentalMemberName } from '#shared/api/rest/rental';
import type {
  OutstandingAmount,
  RentalItemId,
} from '#shared/api/rest/rental/rentalItem';
import type { TopoId } from '#shared/api/rest/topo';

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
