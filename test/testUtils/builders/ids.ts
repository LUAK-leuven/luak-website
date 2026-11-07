import {
  createGearInventoryId,
  createGearItemId,
  type GearInventoryId,
  type GearItemId,
} from '#shared/api/rest/gear';
import { createRentalId, type RentalId } from '#shared/api/rest/rental';

export const aRandomRentalId = (): RentalId =>
  createRentalId(crypto.randomUUID());

export const aRandomGearItemId = (): GearItemId =>
  createGearItemId(crypto.randomUUID());

export const aRandomGearInventoryId = (): GearInventoryId =>
  createGearInventoryId(crypto.randomUUID());
