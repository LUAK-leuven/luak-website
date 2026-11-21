import { expect, test } from 'vitest';

import { SupabaseRentalRepository } from '#shared/adapter-supabase/rental/repository';
import type { RentalItemId } from '#shared/api/rest/rental/rentalItem';
import { aRentalInput } from '#test/builders/rental';
import { testServiceBuilder } from '#test/testServices';
import { testUsers } from '#test/TestUser';

const { supabase, userTestService, testDao } = testServiceBuilder();

// Adds a rental with 3 outstanding and a fully returned rental of the same item.
const addRentalsOfTopo = async (rentalItemId: RentalItemId) => {
  const boardMemberId = await userTestService().getUserId('boardMember');
  const memberId = await userTestService().getUserId('unpaidMembership');

  const outstandingRentalId = await testDao().addRental(
    aRentalInput({ boardMemberId, memberId, topos: { [rentalItemId]: 5 } }),
  );
  await testDao().setRentedItemAmounts({
    rentalId: outstandingRentalId,
    rentalItemId,
    returnedAmount: 1,
    lostAmount: 1,
  });

  const returnedRentalId = await testDao().addRental(
    aRentalInput({ boardMemberId, memberId, topos: { [rentalItemId]: 2 } }),
  );
  await testDao().setRentedItemAmounts({
    rentalId: returnedRentalId,
    rentalItemId,
    returnedAmount: 2,
    lostAmount: 0,
  });

  return outstandingRentalId;
};

test.describe('getRentalsFor', () => {
  test('returns rentals that still have items out, with outstanding amount and member name', async () => {
    const { rentalItemId } = await testDao().addTopo({ amount: 5 });
    const outstandingRentalId = await addRentalsOfTopo(rentalItemId);

    const result = await new SupabaseRentalRepository(supabase()).getRentalsFor(
      rentalItemId,
    );

    expect(result).toEqual([
      {
        id: outstandingRentalId,
        rentedAmount: 3,
        memberName: testUsers.unpaidMembership.fullName,
      },
    ]);
  });
});
