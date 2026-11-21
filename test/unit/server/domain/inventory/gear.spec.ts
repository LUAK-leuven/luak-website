import { expect, test } from 'vitest';

import {
  createLifeSpanInYears,
  createPurchaseDate,
} from '#shared/api/rest/gear';
import { createTotalAmount } from '#shared/api/rest/inventory';
import { calculateEarliestRetirementDate } from '#shared/domain/inventory/gear';
import type { GearInventorySummaryRecord } from '#shared/domain/inventory/InventoryItem';
import { aRandomGearItemId } from '#test/builders/ids';

test('calculateEarliestRetirementDate - ignores archived items', () => {
  const gearInventory = [
    aGearInventorySummaryRecord({
      purchaseDate: createPurchaseDate('2012-01-01'),
      lifespan: createLifeSpanInYears(5),
      totalAmount: createTotalAmount(0),
    }),
    aGearInventorySummaryRecord({
      // 'infinite' lifespan
      purchaseDate: createPurchaseDate('2012-01-01'),
      lifespan: createLifeSpanInYears('infinite'),
      totalAmount: createTotalAmount(0),
    }),
    aGearInventorySummaryRecord({
      // 'missing info'
      totalAmount: createTotalAmount(0),
    }),
    aGearInventorySummaryRecord({
      purchaseDate: createPurchaseDate('2024-01-01'),
      lifespan: createLifeSpanInYears(5),
    }),
    aGearInventorySummaryRecord({
      purchaseDate: createPurchaseDate('2022-01-01'),
      lifespan: createLifeSpanInYears(5),
    }),
  ];

  const earliestDate = calculateEarliestRetirementDate(gearInventory);

  expect(earliestDate).toEqual('2027-01-01');
});

test('calculateEarliestRetirementDate - "missing" if any of the items has "missing" date', () => {
  const gearInventory = [
    aGearInventorySummaryRecord({
      lifespan: createLifeSpanInYears(5),
    }),
    aGearInventorySummaryRecord({
      purchaseDate: createPurchaseDate('2024-01-01'),
      lifespan: createLifeSpanInYears(5),
    }),
    aGearInventorySummaryRecord({
      purchaseDate: createPurchaseDate('2022-01-01'),
      lifespan: createLifeSpanInYears(5),
    }),
  ];

  const earliestDate = calculateEarliestRetirementDate(gearInventory);

  expect(earliestDate).toEqual('missing info');
});

const aGearInventorySummaryRecord = (
  args: Partial<GearInventorySummaryRecord> = {},
): GearInventorySummaryRecord => {
  const defaultArgs: GearInventorySummaryRecord = {
    gearItemId: aRandomGearItemId(),
    productionDate: undefined,
    purchaseDate: undefined,
    lifespan: createLifeSpanInYears(10),
    totalAmount: createTotalAmount(1),
  };
  return {
    ...defaultArgs,
    ...args,
  };
};
