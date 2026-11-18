import type {
  RentalItem,
  RentalItemRepository,
} from '#server/domain/rental/rentalItem';
import { type FixedArray, randomSelection } from '#shared/utils/utils';

export class RentalTestRepository {
  constructor(private readonly rentalItemRepository: RentalItemRepository) {}

  async getRandomSeededTopoRentalItems(): Promise<FixedArray<RentalItem, 1>>;
  async getRandomSeededTopoRentalItems<Amount extends number>(
    amount: Amount,
  ): Promise<FixedArray<RentalItem, Amount>>;
  async getRandomSeededTopoRentalItems(
    amount: number = 1,
  ): Promise<readonly RentalItem[]> {
    const allTopoRentalItems =
      await this.rentalItemRepository.getAllRentalTopoItems();

    return randomSelection(allTopoRentalItems, amount).map((item) => ({
      id: item.id,
      name: item.name,
      depositFee: item.depositFee,
    }));
  }

  async getRandomSeededGearRentalItems(): Promise<FixedArray<RentalItem, 1>>;
  async getRandomSeededGearRentalItems<Amount extends number>(
    amount: Amount,
  ): Promise<FixedArray<RentalItem, Amount>>;
  async getRandomSeededGearRentalItems(
    amount: number = 1,
  ): Promise<readonly RentalItem[]> {
    const allGearRentalItems =
      await this.rentalItemRepository.getAllRentalGearItems();
    return randomSelection(allGearRentalItems, amount);
  }
}
