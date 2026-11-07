import dayjs from 'dayjs';
import { groupBy, min, sumOf } from '~~/shared/utils/utils';
import type { InventoryRepository } from '#server/domain/inventory/repository';
import type { InventoryService } from '#server/domain/inventory/service';
import {
  createRetirementDate,
  type GearInventoryDetails,
  type GearInventorySummary,
  type GearItemId,
  type RetirementDate,
} from '#shared/api/rest/gear';
import type { RentalRepository } from '#server/domain/rental/repository';
import {
  createAvailableAmount,
  createTotalAmount,
} from '#shared/api/rest/inventory';

export class InventoryServiceImpl implements InventoryService {
  constructor(
    private readonly inventoryRepository: InventoryRepository,
    private readonly rentalRepository: RentalRepository,
  ) {}

  async getInventorySummary(): Promise<GearInventorySummary[]> {
    const inventory = groupBy(
      await this.inventoryRepository.getInventorySummary(),
      (item) => item.gearItemId,
    );
    const gearItems = await this.inventoryRepository.getAllGearItems();
    const rented = groupBy(
      await this.rentalRepository.getRentedGearAmounts(),
      (item) => item.gearItemId,
    );
    return gearItems.map((gearItem) => {
      const items = inventory[gearItem.id] ?? [];
      // TODO: TotalAmount of a RentalItem should be different type from TotalAmount of an InventoryItem
      const totalAmount = createTotalAmount(sumOf(items, 'totalAmount'));
      return {
        id: gearItem.id,
        name: gearItem.name,
        totalAmount,
        availableAmount: createAvailableAmount(
          totalAmount - sumOf(rented[gearItem.id] ?? [], 'rentedAmount'),
        ),
        earliestRetirementDate: this.calculateEarliestRetirementDate(
          items,
          gearItem.lifespan,
        ),
        depositFee: gearItem.depositFee,
      };
    });
  }

  async getDetails(id: GearItemId): Promise<GearInventoryDetails> {
    const inventory = await this.inventoryRepository.getInventoryDetails(id);
    const gearItem = await this.inventoryRepository.getGearItem(id);
    const rentals = await this.rentalRepository.getRentalsFor(id);
    const totalAmount = createTotalAmount(sumOf(inventory, 'totalAmount'));
    return {
      id,
      name: gearItem.name,
      lifespan: gearItem.lifespan,
      depositFee: gearItem.depositFee,
      totalAmount,
      availableAmount: createAvailableAmount(
        totalAmount - sumOf(rentals, 'rentedAmount'),
      ),
      inventory: inventory.map((item) => ({
        ...item,
        retirementDate: this.calculateRetirementDate({
          productionDate: item.productionDate,
          purchaseDate: item.purchaseDate,
          lifespan: gearItem.lifespan,
        }),
      })),
      rentals,
    };
  }

  private calculateRetirementDate(args: {
    purchaseDate: string | undefined;
    productionDate: string | undefined;
    lifespan: number;
  }): RetirementDate {
    if (args.lifespan === 0) return createRetirementDate('infinite');
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
      productionDate: string | undefined;
      purchaseDate: string | undefined;
    }[],
    lifespan: number,
  ): GearInventorySummary['earliestRetirementDate'] {
    if (lifespan === 0) return createRetirementDate('infinite');
    const dates = items.map((item) =>
      this.calculateRetirementDate({ ...item, lifespan }),
    );
    return (
      min(dates, (a, b) => {
        if (a === 'infinite' || a === 'missing info') return true;
        if (b === 'infinite' || b === 'missing info') return false;
        return dayjs(a).isBefore(b);
      }) ?? createRetirementDate('missing info')
    );
  }
}
