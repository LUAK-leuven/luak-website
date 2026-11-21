import type { RentalItemWithAvailability } from '#shared/api/rest/rental/availability';
import type { RentalItem } from '#shared/types/board/form/RentalItem';

export const toRentalItem = (topo: RentalItemWithAvailability): RentalItem => ({
  id: topo.id,
  name: topo.name,
  totalAmount: topo.totalAmount,
  availableAmount: topo.availableAmount,
  depositFee: topo.depositFee,
});
