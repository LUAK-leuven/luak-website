import { expect, test } from 'vitest';

import { serviceBuilder } from '#server/serviceBuilder';
import { createGearItemId } from '#shared/api/rest/gear';
import { createItemLostAmount } from '#shared/api/rest/inventory';
import type { RentalId } from '#shared/api/rest/rental';
import { aRentalInput } from '#test/builders/rental';
import { testServiceBuilder } from '#test/testServices';
import { GearService } from '~/services/gearService';
import { rentalDetailsFromDb, RentalService } from '~/services/rentalService';

const { supabase, userTestService, testDao } = testServiceBuilder();
const { inventoryRepo } = serviceBuilder(supabase());
const gearService = new GearService(supabase());

const rentalDetails = async (rentalId: RentalId) =>
  rentalDetailsFromDb(await new RentalService(supabase()).getRental(rentalId));

test.describe('marking gear as lost', () => {
  test('records the lost amount on the rental and the inventory item', async () => {
    // Seeded gear item 'BD C4 .5' with one inventory item
    const gearItemId = createGearItemId('6777b0e7-1b72-4572-821c-f0d7e7ed898c');
    const boardMemberId = await userTestService().getTestUserId('boardMember');
    const memberId = await userTestService().getTestUserId('unpaidMembership');
    const rentalId = await testDao().addRental(
      aRentalInput({ boardMemberId, memberId, gear: { [gearItemId]: 2 } }),
    );
    const inventoryItemId = (
      await inventoryRepo().getInventoryDetails(gearItemId)
    )[0]?.id;
    if (inventoryItemId === undefined)
      throw new Error('Seeded gear item has no inventory item');
    const eventsBefore =
      await inventoryRepo().getInventoryItemEvents(inventoryItemId);

    const { error } = await gearService.markAsLost({
      rentalItemId: gearItemId,
      rentalId: rentalId,
      inventoryItemId: inventoryItemId,
      lostAmount: 1,
    });

    expect(error).toBeNull();
    const rental = await rentalDetails(rentalId);
    expect(rental.gear.find((item) => item.id === gearItemId)?.lostAmount).toBe(
      1,
    );
    const eventsAfter =
      await inventoryRepo().getInventoryItemEvents(inventoryItemId);
    expect(eventsAfter).toHaveLength(eventsBefore.length + 1);
    expect(eventsAfter).toContainEqual(
      expect.objectContaining({
        eventName: 'ItemLostEvent',
        lostAmount: createItemLostAmount(1),
      }),
    );
  });
});

test.describe('marking a topo as lost', () => {
  test('records the lost amount on the rental and the topo inventory item', async () => {
    const { topoId, rentalItemId } = await testDao().addTopo({ amount: 2 });
    const boardMemberId = await userTestService().getTestUserId('boardMember');
    const memberId = await userTestService().getTestUserId('unpaidMembership');
    const rentalId = await testDao().addRental(
      aRentalInput({ boardMemberId, memberId, topos: { [rentalItemId]: 2 } }),
    );

    const { error } = await gearService.markAsLost({
      rentalItemId: rentalItemId,
      inventoryItemId: topoId,
      rentalId: rentalId,
      lostAmount: 1,
    });

    expect(error).toBeNull();
    const rental = await rentalDetails(rentalId);

    expect(
      rental.topos.find((item) => item.id === rentalItemId)?.lostAmount,
    ).toBe(1);
    const events = await inventoryRepo().getInventoryItemEvents(topoId);
    expect(events).toEqual([
      expect.objectContaining({
        eventName: 'ItemLostEvent',
        lostAmount: createItemLostAmount(1),
      }),
    ]);
  });
});
