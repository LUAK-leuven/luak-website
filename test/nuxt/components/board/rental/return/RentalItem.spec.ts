import { mountSuspended } from '@nuxt/test-utils/runtime';
import { describe, expect, test } from 'vitest';

import { createRentalItemName } from '#shared/api/rest/rental/rentalItem';
import { aRandomRentalId, aRentalItem } from '#test/builders/rental';
import RentalItemComponent from '~/components/board/rental/return/RentalItem.vue';

describe('RentalItem', () => {
  test.each([
    [12, 0, 6],
    [12, 10, 9],
    [14, 14, 0],
    [6, 0, -1],
    [6, -1, 0],
    [1, 0, 7],
    [-3, 0, -3],
  ])(
    'changing the value emits updateReturnedAmount',
    async (
      rentedAmount: number,
      returnedAmount: number,
      updatedReturnedAmount: number,
    ) => {
      const wrapper = await mountSuspended(RentalItemComponent, {
        props: {
          rentalId: aRandomRentalId(),
          item: aRentalItem({
            name: createRentalItemName('quickdraw'),
            rentedAmount,
            returnedAmount,
            lostAmount: 0,
          }),
          bouncing: false,
        },
      });

      expect(wrapper.html()).toContain('quickdraw');
      expect(wrapper.html()).toContain(rentedAmount);
      expect(wrapper.html()).toContain(returnedAmount);

      const rentedAmountInput = wrapper.find('input');
      await rentedAmountInput.setValue(updatedReturnedAmount);

      const updateEvent = wrapper.emitted('updateReturnedAmount')!;
      expect(updateEvent).toHaveLength(1);
      expect(updateEvent[0]).toEqual([updatedReturnedAmount]);
    },
  );

  test('clearing the value does not emit updateReturnedAmount', async () => {
    const wrapper = await mountSuspended(RentalItemComponent, {
      props: {
        rentalId: aRandomRentalId(),
        item: aRentalItem({
          rentedAmount: 1,
          returnedAmount: 0,
          lostAmount: 0,
        }),
        bouncing: false,
      },
    });

    const rentedAmountInput = wrapper.find('input');
    await rentedAmountInput.setValue();

    const updateEvent = wrapper.emitted('updateReturnedAmount');
    expect(updateEvent).toBeUndefined();
  });
});
