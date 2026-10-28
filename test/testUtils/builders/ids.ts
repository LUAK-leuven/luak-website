import {
  createGearInventoryId,
  createGearItemId,
  type GearInventoryId,
  type GearItemId,
} from '#shared/api/rest/gear';
import { createTopoId, type TopoId } from '#shared/api/rest/topo';
import { createRentalId, type RentalId } from '#shared/api/rest/rental';

export const aRandomRentalId = (): RentalId =>
  createRentalId(crypto.randomUUID());

export const aRandomTopoId = (): TopoId => createTopoId(crypto.randomUUID());

export const aRandomGearItemId = (): GearItemId =>
  createGearItemId(crypto.randomUUID());

export const aRandomGearInventoryId = (): GearInventoryId =>
  createGearInventoryId(crypto.randomUUID());
