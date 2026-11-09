import { aRental } from '#test/builders/rental';
import { testServiceBuilder } from '#test/testServices';
import { expect, test } from 'vitest';
import { RentalService } from '~/services/rentalService';
import { createDepositFee, createRentalItemId } from '#shared/api/rest/rental';

const { supabase, userTestService } = testServiceBuilder();

const rentalService = new RentalService(supabase());

test('Can create, update and edit a rental', async () => {
  const boardMemberId = await userTestService().getTestUserId('boardMember');
  const memberId = await userTestService().getTestUserId('unpaidMembership');

  const { id, error } = await rentalService.saveRental(
    aRental({
      memberId,
      boardMemberId,
      gear: {
        [createRentalItemId('3825a13b-0002-4d44-b7f8-e8d0d8730cd2')]: 3,
      },
    }),
  );
  expect(error).toBeUndefined();
  if (!id) throw new Error('Rental ID is undefined');

  let rental = await rentalService.getRental(id);
  expect(rental.id).toBe(id);
  expect(rental.RentedItems).toHaveLength(1);
  expect(rental.RentedItems[0]!.rented_amount).toBe(3);

  // Update the rental
  const { error: updateError } = await rentalService.updateRental(id, {
    dateReturn: '2025-01-01',
    depositReturned: true,
    gear: [
      {
        id: createRentalItemId('3825a13b-0002-4d44-b7f8-e8d0d8730cd2'),
        returned_amount: 2,
      },
    ],
    topos: [],
    comments: 'Updated rental',
  });
  expect(updateError).toBeUndefined();

  rental = await rentalService.getRental(id);
  expect(rental.date_return).toBe('2025-01-01');
  expect(rental.deposit_returned).toBe(true);
  expect(rental.RentedItems[0]!.rented_amount).toBe(3);
  expect(rental.RentedItems[0]!.returned_amount).toBe(2);

  // Edit the rental
  const { error: editError } = await rentalService.editRental(id, {
    dateBorrow: '2024-01-01',
    dateReturn: '2025-01-01',
    contactInfo: undefined,
    depositFee: createDepositFee(100),
    gear: {
      [createRentalItemId('3825a13b-0002-4d44-b7f8-e8d0d8730cd2')]: 2,
    },
    topos: {},
    paymentMethod: 'cash',
    comments: 'Edited rental',
  });
  expect(editError).toBeUndefined();

  rental = await rentalService.getRental(id);
  expect(rental.date_borrow).toBe('2024-01-01');
  expect(rental.date_return).toBe('2025-01-01');
  expect(rental.deposit).toBe(100);
  expect(rental.RentedItems[0]!.rented_amount).toBe(2);
  expect(rental.RentedItems[0]!.returned_amount).toBe(2);
});
