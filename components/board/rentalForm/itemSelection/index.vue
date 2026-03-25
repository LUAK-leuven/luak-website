<script lang="ts" setup generic="T extends EntityId<unknown>">
  import { objectEntries } from '@vueuse/core';
  import type { RentalItem } from '~/types/board/form/RentalItem';
  import type { EntityId } from '~/types/ddd';

  const props = withDefaults(
    defineProps<{
      allItems: RentalItem<T>[];
      compositeItems?: Record<string, { itemId: T; amount: number }[]>;
      placeholder: string;
      selectedItems: Record<T, number | undefined>;
    }>(),
    { compositeItems: () => ({}) },
  );

  const emit = defineEmits<{
    computedDeposit: [value: number];
    setItem: [id: T, amount: number];
    removeItem: [id: T];
  }>();

  const selectedItems = computed(() =>
    objectEntries(props.selectedItems)
      .filter(([, amount]) => amount !== undefined)
      .map(([id, amount]) => {
        const item = getBy(props.allItems, 'id', id);
        return {
          id: id,
          name: item.name,
          selectedAmount: amount as number,
          availableAmount: item.availableAmount,
          totalAmount: item.totalAmount,
          depositFee: item.depositFee,
        };
      }),
  );

  const availableItems = computed(() =>
    props.allItems
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
      }))
      .concat(
        objectEntries(props.compositeItems).map(([name, items]) => ({
          id: name as T,
          name: name,
          availableAmount: computeAvailableAmountForCompositeItem(items),
        })),
      ),
  );

  const computeAvailableAmountForCompositeItem = (
    subItems: {
      itemId: T;
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

  const addItem = (id: T) => {
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
    @remove-item="(itemId: T) => emit('removeItem', itemId)"
    @update-selected-item-amount="
      (itemId, amount) => emit('setItem', itemId, amount)
    ">
  </BoardRentalFormItemSelectionOverview>
</template>
