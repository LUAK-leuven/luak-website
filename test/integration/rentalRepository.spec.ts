import { expect, test } from 'vitest';

import { SupabaseRentalRepository } from '#server/adapter-supabase/rental/repository';
import { createGearItemId } from '#shared/api/rest/gear';
import {
  createRentalItemId,
  type RentalItemId,
} from '#shared/api/rest/rental/rentalItem';
import { aRentalInput } from '#test/builders/rental';
import { testServiceBuilder } from '#test/testServices';
import { testUsers } from '#test/TestUser';

const { supabase, userTestService, testDao, rentalTestRepository } =
  testServiceBuilder();

const unpaidMemberName = `${testUsers.unpaidMembership.firstName} ${testUsers.unpaidMembership.lastName}`;

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

test.describe('getRentedTopoAmounts', () => {
  test('returns outstanding amounts for topo rentals, excluding gear rentals', async () => {
    const [gearItem] =
      await rentalTestRepository().getRandomSeededGearRentalItems();
    const [topo] =
      await rentalTestRepository().getRandomSeededTopoRentalItems();

    const gearRentalItemId = createRentalItemId(gearItem.id);
    const boardMemberId = await userTestService().getUserId('boardMember');
    const memberId = await userTestService().getUserId('unpaidMembership');

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

test.describe('getRentedGearAmounts', () => {
  test('returns outstanding amounts of gear items', async () => {
    const [gearItem] =
      await rentalTestRepository().getRandomSeededGearRentalItems();
    const gearItemId = createGearItemId(gearItem.id);
    const boardMemberId = await userTestService().getUserId('boardMember');
    const memberId = await userTestService().getUserId('unpaidMembership');

    const rentalId = await testDao().addRental(
      aRentalInput({
        boardMemberId,
        memberId,
        gear: { [gearItem.id]: 5 },
      }),
    );
    await testDao().setRentedItemAmounts({
      rentalId,
      rentalItemId: gearItem.id,
      returnedAmount: 1,
      lostAmount: 1,
    });

    const result = await new SupabaseRentalRepository(
      supabase(),
    ).getRentedGearAmounts();

    expect(result[gearItemId]).toContain(3);
  });
});

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
        memberName: unpaidMemberName,
      },
    ]);
  });
});

test.describe('getRentalsForTopo', () => {
  test('returns rentals that still have items out, with outstanding amount and member name', async () => {
    const { topoId, rentalItemId } = await testDao().addTopo({ amount: 5 });
    const outstandingRentalId = await addRentalsOfTopo(rentalItemId);

    const result = await new SupabaseRentalRepository(
      supabase(),
    ).getRentalsForTopo(topoId);

    expect(result).toEqual([
      {
        id: outstandingRentalId,
        rentedAmount: 3,
        memberName: unpaidMemberName,
      },
    ]);
  });
});
