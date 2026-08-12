import { groupBy, min, sumOf } from '~~/shared/utils/utils';
import type { GearDao } from '#server/repository/gear';
import type { RentalDao } from '#server/repository/rentals';
import dayjs from 'dayjs';
import type {
  GearInventorySummary,
  RetirementDate,
} from '~~/shared/types/gear';
import type { Date } from '~~/shared/types/common';

export class GearService {
  constructor(
    private readonly gearRepository: GearDao,
    private readonly rentalRepository: RentalDao,
  ) {}

  public async getInventorySummary(): Promise<GearInventorySummary[]> {
    const inventory = await this.gearRepository.getInventorySummary();
    const groupedInventory = groupBy(inventory, (x) => x.gearItemId);
    const gearItems = await this.gearRepository.getAllGearItems();
    const rentedGearAmounts =
      await this.rentalRepository.getRentedGearAmounts();
    const groupedRentedAmounts = groupBy(
      rentedGearAmounts,
      (x) => x.gearItemId,
    );

    return gearItems.map((gearItem) => {
      const inventoryItems = groupedInventory[gearItem.id] ?? [];
      const totalAmount = sumOf(inventoryItems, 'totalAmount');
      const rentedItems = groupedRentedAmounts[gearItem.id] ?? [];
      const rentedAmount = sumOf(rentedItems, 'rentedAmount');
      return {
        id: gearItem.id,
        name: gearItem.name,
        totalAmount: totalAmount,
        availableAmount: totalAmount - rentedAmount,
        earliestRetirementDate: this.calculateEarliestRetirementDate(
          inventoryItems,
          gearItem.lifespan,
        ),
        depositFee: gearItem.depositFee,
      };
    });
  }

  public async getDetails(id: GearItemId): Promise<GearInventoryDetails> {
    const inventoryDetails = await this.gearRepository.getInventoryDetails(id);
    const gearItem = await this.gearRepository.getGearItem(id);
    const rentals = await this.rentalRepository.getRentalsFor(id);

    const totalAmount = sumOf(inventoryDetails, 'totalAmount');
    const rentedAmount = sumOf(rentals, 'rentedAmount');

    return {
      id: id,
      name: gearItem.name,
      lifespan: gearItem.lifespan,
      depositFee: gearItem.depositFee,
      totalAmount: totalAmount,
      availableAmount: totalAmount - rentedAmount,
      inventory: inventoryDetails.map((item) => {
        return {
          id: item.id,
          productionDate: item.productionDate,
          purchaseDate: item.purchaseDate,
          retirementDate: this.calculateRetirementDate({
            productionDate: item.productionDate,
            purchaseDate: item.purchaseDate,
            lifespan: gearItem.lifespan,
          }),
          details: item.details,
          initialAmount: item.initialAmount,
          totalAmount: item.totalAmount,
          events: item.events,
        };
      }),
      rentals,
    };
  }

  private calculateRetirementDate(args: {
    purchaseDate: string | undefined;
    productionDate: string | undefined;
    lifespan: number;
  }): RetirementDate {
    if (args.lifespan === 0) return 'infinite';
    const startDate =
      args.purchaseDate !== undefined
        ? dayjs(args.purchaseDate)
        : args.productionDate !== undefined
          ? dayjs(args.productionDate).add(1, 'year')
          : undefined;
    if (startDate === undefined) return 'missing info';
    return startDate.add(args.lifespan, 'y').format('YYYY-MM-DD') as Date;
  }

  private calculateEarliestRetirementDate(
    inventoryItems: {
      productionDate: string | undefined;
      purchaseDate: string | undefined;
    }[],
    lifespan: number,
  ): GearInventorySummary['earliestRetirementDate'] {
    if (lifespan === 0) return 'infinite';

    const retirementDates = inventoryItems.map((item) =>
      this.calculateRetirementDate({
        purchaseDate: item.purchaseDate,
        productionDate: item.productionDate,
        lifespan: lifespan,
      }),
    );
    const earliestRetirementDate =
      min(retirementDates, (a, b) => {
        if (a === 'infinite' || a === 'missing info') return true;
        if (b === 'infinite' || b === 'missing info') return false;
        return dayjs(a).isBefore(b);
      }) ?? undefined;

    if (earliestRetirementDate === undefined) return 'missing info';
    return earliestRetirementDate;
  }
}
