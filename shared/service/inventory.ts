import type { GearInventoryDetails, GearItemId } from '#shared/api/rest/gear';
import {
  createAvailableAmount,
  type RentalItemWithAvailability,
} from '#shared/api/rest/rental/availability';
import {
  createTotalAmount,
  RentalItemType,
} from '#shared/api/rest/rental/rentalItem';
import { calculateRetirementDate } from '#shared/domain/inventory/gear';
import type { InventoryRepository } from '#shared/domain/inventory/repository';
import type { InventoryService } from '#shared/domain/inventory/service';
import type { RentalItemRepository } from '#shared/domain/rental/rentalItem';
import type { RentalRepository } from '#shared/domain/rental/repository';
import { groupBy, sum, sumOf } from '#shared/utils/utils';

export class InventoryServiceImpl implements InventoryService {
  constructor(
    private readonly inventoryRepository: InventoryRepository,
    private readonly rentalRepository: RentalRepository,
    private readonly rentalItemRepository: RentalItemRepository,
  ) {}

  async getInventorySummary(): Promise<RentalItemWithAvailability[]> {
    const inventory = groupBy(
      await this.inventoryRepository.getInventorySummary(),
      (item) => item.gearItemId,
    );
    const gearItems = await this.rentalItemRepository.getAllRentalGearItems();
    const rented = await this.rentalRepository.getRentedGearAmounts();

    return gearItems.map((gearItem) => {
      const items = inventory[gearItem.id] ?? [];
      const totalAmount = createTotalAmount(sumOf(items, 'totalAmount'));
      return {
        id: gearItem.id,
        name: gearItem.name,
        totalAmount,
        availableAmount: createAvailableAmount(
          totalAmount - sum(rented[gearItem.id] ?? []),
        ),
        depositFee: gearItem.depositFee,
      };
    });
  }

  async getRentalItemsWithAvailability(
    itemType: RentalItemType,
  ): Promise<RentalItemWithAvailability[]> {
    switch (itemType) {
      case RentalItemType.gear:
        return await this.getInventorySummary();
      case RentalItemType.topo:
        return await this.rentalItemRepository.getAllRentalTopoItems();
    }
    throw new Error('Method not implemented.');
  }

  async getDetails(id: GearItemId): Promise<GearInventoryDetails> {
    const inventory = await this.inventoryRepository.getInventoryDetails(id);
    const gearItem = await this.inventoryRepository.getGearItem(id);
    const rentals = await this.rentalRepository.getRentalsFor(id);
    const totalAmount = createTotalAmount(sumOf(inventory, 'amount'));
    return {
      id,
      name: gearItem.name,
      depositFee: gearItem.depositFee,
      totalAmount,
      availableAmount: createAvailableAmount(
        totalAmount - sumOf(rentals, 'rentedAmount'),
      ),
      inventory: inventory.map((item) => ({
        ...item,
        totalAmount: item.amount,
        retirementDate: calculateRetirementDate({
          productionDate: item.productionDate,
          purchaseDate: item.purchaseDate,
          lifespan: item.lifespan,
        }),
      })),
      rentals,
    };
  }
}
