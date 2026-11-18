import { mockComponent, mountSuspended } from '@nuxt/test-utils/runtime';
import { expect, test } from 'vitest';

import { createDepositFee } from '#shared/api/rest/rental';
import { createAvailableAmount } from '#shared/api/rest/rental/availability';
import {
  createRentalItemName,
  createTotalAmount,
} from '#shared/api/rest/rental/rentalItem';
import type { RentalItem } from '#shared/types/board/form/RentalItem';
import { aRandomRentalItemId } from '#test/builders/rental';
import { emitFromChild } from '#test/vitest/emitFromChild';
import ItemSelection from '~/components/board/rental/form/itemSelection/index.vue';
import SearchBar from '~/components/board/rental/form/itemSelection/searchBar.vue';

mockComponent('~/components/board/rental/form/itemSelection/searchBar.vue', {
  props: ['availableItems', 'placeholder'],
  emits: ['onSelect'],
});

test('Selecting an item that is not selected yet emits setItem with amount 1', async () => {
  const rentalItemId = aRandomRentalItemId();
  const wrapper = await mountItemSelection({
    allItems: [
      aRentalItem({
        id: rentalItemId,
        name: createRentalItemName('carabiner'),
      }),
    ],
  });

  emitFromChild(wrapper, SearchBar, 'onSelect', [rentalItemId]);

  expect(wrapper.emitted('setItem')).toEqual([[rentalItemId, 1]]);
});

test('Selecting an already selected item emits setItem with its selected amount plus one', async () => {
  const rentalItemId = aRandomRentalItemId();
  const wrapper = await mountItemSelection({
    allItems: [
      aRentalItem({
        id: rentalItemId,
        name: createRentalItemName('carabiner'),
      }),
    ],
    selectedItems: { [rentalItemId]: 2 },
  });

  emitFromChild(wrapper, SearchBar, 'onSelect', [rentalItemId]);

  expect(wrapper.emitted('setItem')).toEqual([[rentalItemId, 3]]);
});

test('Selecting a composite item emits setItem for each of its sub-items', async () => {
  const carabinerId = aRandomRentalItemId();
  const ropeId = aRandomRentalItemId();
  const compositeId = aRandomRentalItemId();
  const wrapper = await mountItemSelection({
    allItems: [
      aRentalItem({ id: carabinerId, name: createRentalItemName('carabiner') }),
      aRentalItem({ id: ropeId, name: createRentalItemName('rope') }),
    ],
    compositeItems: {
      [compositeId]: [
        { itemId: carabinerId, amount: 2 },
        { itemId: ropeId, amount: 1 },
      ],
    },
    selectedItems: {
      [carabinerId]: 1,
    },
  });

  emitFromChild(wrapper, SearchBar, 'onSelect', [compositeId]);

  expect(wrapper.emitted('setItem')).toEqual([
    [carabinerId, 3],
    [ropeId, 1],
  ]);
});

type ItemSelectionProps = InstanceType<typeof ItemSelection>['$props'];

const mountItemSelection = (props: Partial<ItemSelectionProps>) =>
  mountSuspended(ItemSelection, {
    props: {
      allItems: [],
      compositeItems: {},
      placeholder: 'Select an item',
      selectedItems: {},
      ...props,
    },
  });

const aRentalItem = (args: Partial<RentalItem> = {}): RentalItem => {
  const defaultArgs: RentalItem = {
    id: aRandomRentalItemId(),
    name: createRentalItemName('an item'),
    totalAmount: createTotalAmount(3),
    availableAmount: createAvailableAmount(2),
    depositFee: createDepositFee(500),
  };
  return { ...defaultArgs, ...args };
};
