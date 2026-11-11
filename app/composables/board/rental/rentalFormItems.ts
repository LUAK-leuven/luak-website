import type { GearInventorySummary } from '#shared/api/rest/gear';
import { createDepositFee } from '#shared/api/rest/rental';
import {
  createRentalItemName,
  type TotalAmount as RentalItemTotalAmount,
} from '#shared/api/rest/rental/rentalItem';
import type { TopoListItem } from '#shared/api/rest/topo';
import type { RentalItem } from '#shared/types/board/form/RentalItem';

// TODO LUAK-39: fix mappings; name should already be a RentalItemName and topo should not recreate the name with yearPublished
export const toRentalFormGearItem = (
  gear: GearInventorySummary,
): RentalItem => ({
  id: gear.id,
  name: createRentalItemName(gear.name),
  totalAmount: gear.totalAmount,
  availableAmount: gear.availableAmount,
  depositFee: gear.depositFee,
});

export const toRentalFormTopoItem = (
  topo: Omit<TopoListItem, 'totalAmount'> & {
    totalAmount: RentalItemTotalAmount;
  },
): RentalItem => ({
  id: topo.id,
  name: createRentalItemName(
    topo.yearPublished === undefined
      ? topo.title
      : `${topo.title} (${topo.yearPublished.toFixed()})`,
  ),
  totalAmount: topo.totalAmount,
  availableAmount: topo.availableAmount,
  depositFee: createDepositFee(500),
});
