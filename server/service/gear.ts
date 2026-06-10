import { groupBy, min, sumOf } from '~/utils/utils';
import type { GearDao } from '../repository/gear';
import type { GearInventorySummary } from '~/types/gear';
import type { RentalDao } from '../repository/rentals';
import dayjs from 'dayjs';

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

    return gearItems.map((gearItem) => {
      const inventoryItems = groupedInventory[gearItem.id] ?? [];
      const totalAmount = sumOf(inventoryItems, 'totalAmount');
      const rentedAmount =
        rentedGearAmounts.find((x) => x.gearItemId === gearItem.id)
          ?.rentedAmount ?? 0;
      return {
        id: gearItem.id,
        name: gearItem.name,
        totalAmount: totalAmount,
        availableAmount: totalAmount - rentedAmount,
        earliestRetirementDate: this.calculateEarliestRetirementDate(
          inventoryItems,
          gearItem.lifespan,
        )?.format('YYYY-MM-DD'),
      };
    });
  }

  private calculateRetirementDate(args: {
    purchaseDate: string | undefined;
    productionDate: string | undefined;
    lifespan: number;
  }) {
    const productionDate = args.productionDate
      ? dayjs(args.productionDate)
      : undefined;
    const purchaseDate = args.purchaseDate
      ? dayjs(args.purchaseDate)
      : undefined;
    const startDate =
      purchaseDate !== undefined
        ? purchaseDate
        : productionDate !== undefined
          ? productionDate.add(1, 'year')
          : undefined;
    return startDate?.add(args.lifespan, 'y');
  }

  private calculateEarliestRetirementDate(
    inventoryItems: {
      productionDate: string | undefined;
      purchaseDate: string | undefined;
    }[],
    lifespan: number,
  ) {
    const retirementDates = inventoryItems.map((item) =>
      this.calculateRetirementDate({
        purchaseDate: item.purchaseDate,
        productionDate: item.productionDate,
        lifespan: lifespan,
      }),
    );
    return (
      min(retirementDates, (a, b) => {
        if (a === undefined) return true;
        if (b === undefined) return false;
        return a.isBefore(b);
      }) ?? undefined
    );
  }
}
