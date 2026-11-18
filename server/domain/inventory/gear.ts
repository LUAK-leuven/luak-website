import dayjs from 'dayjs';

import type { GearInventorySummaryRecord } from '#server/domain/inventory/InventoryItem';
import type {
  GearInventorySummary,
  LifeSpanInYears,
  ProductionDate,
  PurchaseDate,
  RetirementDate,
} from '#shared/api/rest/gear';
import { createRetirementDate } from '#shared/api/rest/gear';

export const calculateRetirementDate = (args: {
  purchaseDate: PurchaseDate | undefined;
  productionDate: ProductionDate | undefined;
  lifespan: LifeSpanInYears;
}): RetirementDate => {
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
};

export const calculateEarliestRetirementDate = (
  items: GearInventorySummaryRecord[],
): GearInventorySummary['earliestRetirementDate'] => {
  let earliestDate: RetirementDate = createRetirementDate('missing info');
  for (const item of items) {
    if (isArchived(item)) continue;

    const date = calculateRetirementDate(item);
    if (date === 'infinite' || date === 'missing info') return date;
    if (earliestDate === 'missing info') earliestDate = date;
    if (date < earliestDate) earliestDate = date;
  }
  return earliestDate;
};

const isArchived = (item: GearInventorySummaryRecord): boolean => {
  return item.totalAmount === 0;
};
