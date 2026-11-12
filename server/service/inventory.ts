import dayjs from 'dayjs';

import type { InventoryRepository } from '#server/domain/inventory/repository';
import type { InventoryService } from '#server/domain/inventory/service';
import type { RentalItemRepository } from '#server/domain/rental/rentalItem';
import type { RentalRepository } from '#server/domain/rental/repository';
import {
  createRetirementDate,
  type GearInventoryDetails,
  type GearInventorySummary,
  type GearItemId,
  type LifeSpanInYears,
  type ProductionDate,
  type PurchaseDate,
  type RetirementDate,
} from '#shared/api/rest/gear';
import { createAvailableAmount } from '#shared/api/rest/rental/availability';
import { createTotalAmount } from '#shared/api/rest/rental/rentalItem';
import { groupBy, sum, sumOf } from '#shared/utils/utils';

export class InventoryServiceImpl implements InventoryService {
  constructor(
    private readonly inventoryRepository: InventoryRepository,
    private readonly rentalRepository: RentalRepository,
    private readonly rentalItemRepository: RentalItemRepository,
  ) {}

  async getInventorySummary(): Promise<GearInventorySummary[]> {
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
        earliestRetirementDate: this.calculateEarliestRetirementDate(items),
        depositFee: gearItem.depositFee,
      };
    });
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
        ...item, // TODO: this should throw a lint error because 'amount' is no prop in GearInventoryDetails['inventory']
        totalAmount: item.amount,
        retirementDate: this.calculateRetirementDate({
          productionDate: item.productionDate,
          purchaseDate: item.purchaseDate,
          lifespan: item.lifespan,
        }),
      })),
      rentals,
    };
  }

  private calculateRetirementDate(args: {
    purchaseDate: PurchaseDate | undefined;
    productionDate: ProductionDate | undefined;
    lifespan: LifeSpanInYears;
  }): RetirementDate {
    if (args.lifespan === 'infinite') return createRetirementDate('infinite');
    const startDate = args.purchaseDate
      ? dayjs(args.purchaseDate)
      : args.productionDate
        ? dayjs(args.productionDate).add(1, 'year')
        : undefined;
    if (!startDate) return createRetirementDate('missing info');
    return createRetirementDate(
      startDate.add(args.lifespan, 'y').format('YYYY-MM-DD'),
    );
  }

  private calculateEarliestRetirementDate(
    items: {
      productionDate: ProductionDate | undefined;
      purchaseDate: PurchaseDate | undefined;
      lifespan: LifeSpanInYears;
    }[],
  ): GearInventorySummary['earliestRetirementDate'] {
    let earliestDate: RetirementDate = createRetirementDate('missing info');
    for (const item of items) {
      const date = this.calculateRetirementDate(item);
      if (date === 'infinite') return createRetirementDate('infinite');
      if (earliestDate === 'missing info') earliestDate = date;
      if (date < earliestDate) earliestDate = date;
    }
    return earliestDate;
  }
}
