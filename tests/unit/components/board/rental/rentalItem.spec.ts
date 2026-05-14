import { describe, expect, test } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import RentalItem from '~/components/board/rental/return/rentalItem.vue';
import type { GearItemId, TopoId } from '~/types/gear';
import type { RentalId } from '~/types/rental';

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
      const wrapper = await mountSuspended(RentalItem, {
        props: {
          rentalId: crypto.randomUUID() as RentalId,
          itemId: { type: 'topo', id: crypto.randomUUID() as TopoId },
          name: 'quickdraw',
          rentedAmount: rentedAmount,
          returnedAmount: returnedAmount,
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
    const wrapper = await mountSuspended(RentalItem, {
      props: {
        rentalId: crypto.randomUUID() as RentalId,
        itemId: { type: 'gear', id: crypto.randomUUID() as GearItemId },
        name: 'quickdraw',
        rentedAmount: 1,
        returnedAmount: 0,
        bouncing: false,
      },
    });

    const rentedAmountInput = wrapper.find('input');
    await rentedAmountInput.setValue();

    const updateEvent = wrapper.emitted('updateReturnedAmount');
    expect(updateEvent).toBeUndefined();
  });
});
