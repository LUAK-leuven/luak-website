import type { GearInventorySummary } from '#shared/api/rest/gear';
import type { RentalItemWithAvailability } from '#shared/api/rest/rental/availability';
import type { RentalItem } from '#shared/types/board/form/RentalItem';

export const toRentalFormGearItem = (
  gear: GearInventorySummary,
): RentalItem => ({
  id: gear.id,
  name: gear.name,
  totalAmount: gear.totalAmount,
  availableAmount: gear.availableAmount,
  depositFee: gear.depositFee,
});

export const toRentalFormTopoItem = (
  topo: RentalItemWithAvailability,
): RentalItem => ({
  id: topo.id,
  name: topo.name,
  totalAmount: topo.totalAmount,
  availableAmount: topo.availableAmount,
  depositFee: topo.depositFee,
});
