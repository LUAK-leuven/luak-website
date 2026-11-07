import { expect, test } from 'vitest';
import { InventoryServiceImpl } from '#server/service/inventory';
import { createGearItemId, createGearName } from '#shared/api/rest/gear';
import { createTotalAmount } from '#shared/api/rest/inventory';
import { createOutstandingAmount } from '#shared/api/rest/rental';
import { inventoryRepositoryMock, rentalRepositoryMock } from '#test/mocks';

test('maps gear stock and allows negative availability', async () => {
  const gearItemId = createGearItemId('00000000-0000-4000-8000-000000000001');
  const result = await new InventoryServiceImpl(
    inventoryRepositoryMock({
      getInventorySummary: () =>
        Promise.resolve([
          {
            gearItemId,
            productionDate: undefined,
            purchaseDate: undefined,
            totalAmount: createTotalAmount(3),
          },
        ]),
      getAllGearItems: () =>
        Promise.resolve([
          {
            id: gearItemId,
            name: createGearName('Carabiner'),
            lifespan: 0,
            depositFee: 500,
          },
        ]),
    }),
    rentalRepositoryMock({
      getRentedGearAmounts: () =>
        Promise.resolve([
          { gearItemId, rentedAmount: createOutstandingAmount(4) },
        ]),
    }),
  ).getInventorySummary();

  expect(result[0]).toMatchObject({
    totalAmount: 3,
    availableAmount: -1,
  });
});
