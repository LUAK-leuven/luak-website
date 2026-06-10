import { groupBy, min, sumOf } from '~/utils/utils';
import type { GearDao } from '../repository/gear';
import type {
  GearInventoryDetails,
  GearInventorySummary,
  GearItemId,
} from '~/types/gear';
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
          })?.format('YYYY-MM-DD'),
          details: item.details,
          totalAmount: item.totalAmount,
          status: item.status,
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
