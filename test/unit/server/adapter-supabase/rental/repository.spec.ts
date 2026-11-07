import { expect, test } from 'vitest';
import { mapRental } from '#server/adapter-supabase/rental/repository';

test('maps a rented item to its outstanding amount', () => {
  expect(
    mapRental({
      rented_amount: 5,
      returned_amount: 1,
      lost_amount: 1,
      Rentals: {
        id: '00000000-0000-4000-8000-000000000001',
        member: { first_name: 'Ada', last_name: 'Lovelace' },
        contact_info: null,
      },
    }),
  ).toMatchObject({
    id: '00000000-0000-4000-8000-000000000001',
    rentedAmount: 3,
    memberName: 'Ada Lovelace',
  });
});

test('rejects a negative computed rented amount', () => {
  expect(() =>
    mapRental({
      rented_amount: 2,
      returned_amount: 1,
      lost_amount: 2,
      Rentals: {
        id: '00000000-0000-4000-8000-000000000001',
        member: { first_name: 'Ada', last_name: 'Lovelace' },
        contact_info: null,
      },
    }),
  ).toThrow();
});
