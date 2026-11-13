import { expect, test } from 'vitest';

import { SupabaseRentalRepository } from '#server/adapter-supabase/rental/repository';
import { createRentalItemId } from '#shared/api/rest/rental/rentalItem';
import { aRentalInput } from '#test/builders/rental';
import { testServiceBuilder } from '#test/testServices';

const { supabase, userTestService, testDao, rentalTestRepository } =
  testServiceBuilder();

test.describe('getRentedTopoAmounts', () => {
  test('returns outstanding amounts for topo rentals, excluding gear rentals', async () => {
    const [gearItem] =
      await rentalTestRepository().getRandomSeededGearRentalItems();
    const [topo] =
      await rentalTestRepository().getRandomSeededTopoRentalItems();

    const gearRentalItemId = createRentalItemId(gearItem.id);
    const boardMemberId = await userTestService().getTestUserId('boardMember');
    const memberId = await userTestService().getTestUserId('unpaidMembership');

    const rentalId = await testDao().addRental(
      aRentalInput({
        boardMemberId,
        memberId,
        gear: { [gearRentalItemId]: 5 },
        topos: { [topo.id]: 4 },
      }),
    );
    await testDao().setRentedItemAmounts({
      rentalId,
      rentalItemId: topo.id,
      returnedAmount: 1,
      lostAmount: 1,
    });

    const result = await new SupabaseRentalRepository(
      supabase(),
    ).getRentedTopoAmounts();

    expect(
      result.find((amount) => amount.rentalItemId === topo.id)?.rentedAmount,
    ).toBe(2);
    expect(
      result.some((amount) => amount.rentalItemId === gearRentalItemId),
    ).toBe(false);
  });
});
