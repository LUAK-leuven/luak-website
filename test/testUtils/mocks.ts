import type { InventoryRepository } from '#server/domain/inventory/repository';
import type { RentalItemRepository } from '#server/domain/rental/rentalItem';
import type { RentalRepository } from '#server/domain/rental/repository';
import type { TopoRepository } from '#server/domain/topo/repository';

export const topoRepositoryMock = (
  overrides: Partial<TopoRepository>,
): TopoRepository => ({
  getDetails: () => unused(),
  getTopoLibrary: () => unused(),
  getTopos: () => unused(),
  getAllTopoInventoryItemEvents: () => unused(),
  ...overrides,
});

export const inventoryRepositoryMock = (
  overrides: Partial<InventoryRepository> = {},
): InventoryRepository => ({
  getInventorySummary: () => unused(),
  getInventoryDetails: () => unused(),
  getAllGearItems: () => unused(),
  getGearItem: () => unused(),
  getInventoryItemEvents: () => unused(),
  getAllGearInventoryItemEvents: () => unused(),
  ...overrides,
});

export const rentalRepositoryMock = (
  overrides: Partial<RentalRepository> = {},
): RentalRepository => ({
  getRentedGearAmounts: () => unused(),
  getRentedTopoAmounts: () => unused(),
  getRentalsFor: () => unused(),
  getRentalsForTopo: () => unused(),
  ...overrides,
});

export const rentalItemRepositoryMock = (
  overrides: Partial<RentalItemRepository> = {},
): RentalItemRepository => ({
  getAllRentalGearItems: () => unused(),
  getAllRentalTopoItems: () => unused(),
  ...overrides,
});

const unused = () => Promise.reject(new Error('Not used in this test'));
