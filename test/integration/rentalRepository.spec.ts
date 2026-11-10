import { expect, test } from 'vitest';
import { aRentalInput } from '#test/builders/rental';
import { createRentalItemId } from '#shared/api/rest/rental';
import { testServiceBuilder } from '#test/testServices';
import { SupabaseRentalRepository } from '#server/adapter-supabase/rental/repository';
import { SupabaseTopoRepository } from '#server/adapter-supabase/topo/repository';
import { SupabaseInventoryRepository } from '#server/adapter-supabase/inventory/repository';
import type { GearItemRecord } from '~~/server/domain/inventory/InventoryItem';
import type { TopoSummary } from '~~/server/domain/topo/topo';

const { supabase, userTestService, testDao } = testServiceBuilder();

test.describe('getRentedTopoAmounts', () => {
  test('returns outstanding amounts for topo rentals, excluding gear rentals', async () => {
    const gearItem = await getSeededGearItem();
    const topo = await getSeededTopo();

    const gearRentalItemId = createRentalItemId(gearItem.id);
    const boardMemberId = await userTestService().getTestUserId('boardMember');
    const memberId = await userTestService().getTestUserId('unpaidMembership');

    const rentalId = await testDao().addRental(
      aRentalInput({
        boardMemberId,
        memberId,
        gear: { [gearRentalItemId]: 5 },
        topos: { [topo.rentalItemId]: 4 },
      }),
    );
    await testDao().setRentedItemAmounts({
      rentalId,
      rentalItemId: topo.rentalItemId,
      returnedAmount: 1,
      lostAmount: 1,
    });

    const result = await new SupabaseRentalRepository(
      supabase(),
    ).getRentedTopoAmounts();

    expect(
      result.find((amount) => amount.rentalItemId === topo.rentalItemId)
        ?.rentedAmount,
    ).toBe(2);
    expect(
      result.some((amount) => amount.rentalItemId === gearRentalItemId),
    ).toBe(false);
  });
});

const getSeededTopo = async (): Promise<TopoSummary> => {
  const [topo] = await new SupabaseTopoRepository(supabase()).getTopos();
  if (!topo) throw new Error('Seeded topo item not found');
  return topo;
};

const getSeededGearItem = async (): Promise<GearItemRecord> => {
  const [gearItem] = await new SupabaseInventoryRepository(
    supabase(),
  ).getAllGearItems();
  if (!gearItem) throw new Error('Seeded gear item not found');
  return gearItem;
};
