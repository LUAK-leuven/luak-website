import type { GearInventoryId, GearItemId } from '#shared/api/rest/gear';
import type { TopoId } from '#shared/api/rest/topo';
import type { RentalId } from '#shared/types/rental';

export const aRandomRentalId = (): RentalId => crypto.randomUUID() as RentalId;

export const aRandomTopoId = (): TopoId => crypto.randomUUID() as TopoId;

export const aRandomGearItemId = (): GearItemId =>
  crypto.randomUUID() as GearItemId;

export const aRandomGearInventoryId = (): GearInventoryId =>
  crypto.randomUUID() as GearInventoryId;
