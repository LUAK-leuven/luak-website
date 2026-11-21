import { expect, test } from 'vitest';

import { SupabaseRentalItemRepository } from '#shared/adapter-supabase/rental/rentalItem';
import { aRentalInput } from '#test/builders/rental';
import { testServiceBuilder } from '#test/testServices';

const { supabase, userTestService, testDao } = testServiceBuilder();

test.describe('getAllRentalTopoItems', () => {
  test('availability is the total amount minus the outstanding amount', async () => {
    const { rentalItemId } = await testDao().addTopo({ amount: 5 });
    const boardMemberId = await userTestService().getUserId('boardMember');
    const memberId = await userTestService().getUserId('unpaidMembership');

    const rentalId = await testDao().addRental(
      aRentalInput({ boardMemberId, memberId, topos: { [rentalItemId]: 3 } }),
    );
    await testDao().setRentedItemAmounts({
      rentalId,
      rentalItemId,
      returnedAmount: 1,
      lostAmount: 1,
    });

    const items = await new SupabaseRentalItemRepository(
      supabase(),
    ).getAllRentalTopoItems();

    const item = items.find((topo) => topo.id === rentalItemId);
    expect(item?.totalAmount).toBe(5);
    expect(item?.availableAmount).toBe(4);
  });
});
