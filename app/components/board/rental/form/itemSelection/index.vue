<script lang="ts" setup>
  import { objectEntries } from '@vueuse/core';

  import {
    type AvailableAmount,
    createAvailableAmount,
  } from '#shared/api/rest/inventory';
  import type { RentalItemId } from '#shared/api/rest/rental/rentalItem';
  import type { RentalItem } from '#shared/types/board/form/RentalItem';

  const props = withDefaults(
    defineProps<{
      allItems: RentalItem[];
      compositeItems?: Record<
        string,
        { itemId: RentalItemId; amount: number }[]
      >;
      placeholder: string;
      selectedItems: Record<RentalItemId, number | undefined>;
    }>(),
    { compositeItems: () => ({}) },
  );

  const emit = defineEmits<{
    computedDeposit: [value: number];
    setItem: [id: RentalItemId, amount: number];
    removeItem: [id: RentalItemId];
  }>();

  const selectedItems = computed(() =>
    objectEntries(props.selectedItems).flatMap(([id, amount]) => {
      if (amount === undefined) return [];

      const item = getBy(props.allItems, 'id', id);
      return {
        id: id,
        name: item.name,
        selectedAmount: amount,
        availableAmount: item.availableAmount,
        totalAmount: item.totalAmount,
        depositFee: item.depositFee,
      };
    }),
  );

  const availableItems = computed<
    { id: RentalItemId; name: string; availableAmount: AvailableAmount }[]
  >(() => [
    ...props.allItems
      .filter(
        (it) =>
          !selectedItems.value.some(
            (selectedItem) => selectedItem.name === it.name,
          ),
      )
      .map((it) => ({
        id: it.id,
        name: it.name,
        availableAmount: it.availableAmount,
      })),
    ...objectEntries(props.compositeItems).map(([name, items]) => ({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
      id: name as RentalItemId,
      name: name,
      availableAmount: createAvailableAmount(
        computeAvailableAmountForCompositeItem(items),
      ),
    })),
  ]);

  const computeAvailableAmountForCompositeItem = (
    subItems: {
      itemId: RentalItemId;
      amount: number;
    }[],
  ) =>
    Math.min(
      ...subItems.map(({ itemId, amount }) => {
        const item = getBy(props.allItems, 'id', itemId);
        return Math.floor(item.availableAmount / amount);
      }),
    );

  const getDefaultAmount = (item: { name: string }) =>
    item.name === 'quickdraw' ? 12 : 1;

  const addItem = (id: RentalItemId) => {
    const compositeItem = props.compositeItems[id];
    if (compositeItem !== undefined) {
      for (const { itemId, amount } of compositeItem) {
        emit('setItem', itemId, amount);
      }
    } else {
      const item = getBy(props.allItems, 'id', id);
      const defaultAmount = getDefaultAmount(item);
      const selectedAmount = props.selectedItems[item.id];
      if (selectedAmount === undefined) {
        emit('setItem', item.id, defaultAmount);
      } else {
        emit('setItem', item.id, selectedAmount + defaultAmount);
      }
    }
  };

  watch(selectedItems, (selectedItem) => {
    const depositFee = selectedItem.reduce(
      (sum, { depositFee, selectedAmount }) =>
        sum + depositFee * selectedAmount,
      0,
    );
    emit('computedDeposit', depositFee);
  });
</script>

<template>
  <BoardRentalFormItemSelectionSearchBar
    :available-items="availableItems"
    :placeholder="placeholder"
    @on-select="addItem">
  </BoardRentalFormItemSelectionSearchBar>

  <BoardRentalFormItemSelectionOverview
    :selected-items="selectedItems"
    @remove-item="(itemId: RentalItemId) => emit('removeItem', itemId)"
    @update-selected-item-amount="
      (itemId, amount) => emit('setItem', itemId, amount)
    ">
  </BoardRentalFormItemSelectionOverview>
</template>
