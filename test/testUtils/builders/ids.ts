import {
  createGearInventoryId,
  createGearItemId,
  type GearInventoryId,
  type GearItemId,
} from '#shared/api/rest/gear';
import { createUserId } from '#shared/api/rest/user';

export const aRandomGearItemId = (): GearItemId =>
  createGearItemId(crypto.randomUUID());

export const aRandomGearInventoryId = (): GearInventoryId =>
  createGearInventoryId(crypto.randomUUID());

export const aRandomUserId = () => createUserId(crypto.randomUUID());
