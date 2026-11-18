<script lang="ts" setup>
  import { objectEntries } from '@vueuse/core';

  import {
    type AvailableAmount,
    createAvailableAmount,
  } from '#shared/api/rest/rental/availability';
  import {
    createRentalItemName,
    type RentalItemId,
    type RentalItemName,
  } from '#shared/api/rest/rental/rentalItem';
  import type { RentalItem } from '#shared/types/board/form/RentalItem';
  import SearchBar from '~/components/board/rental/form/itemSelection/searchBar.vue';
  import SelectionOverview from '~/components/board/rental/form/itemSelection/selectionOverview.vue';

  type CompositeItems = Record<string, CompositeSubItem[]>;
  type CompositeSubItem = {
    itemId: RentalItemId;
    amount: number;
  };

  const props = withDefaults(
    defineProps<{
      allItems: RentalItem[];
      compositeItems?: Partial<CompositeItems>;
      placeholder: string;
      selectedItems: Partial<Record<RentalItemId, number>>;
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
    {
      id: RentalItemId;
      name: RentalItemName;
      availableAmount: AvailableAmount;
    }[]
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
    ...objectEntries(props.compositeItems).flatMap(([name, items]) => {
      if (items === undefined) return [];
      return {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        id: name as RentalItemId,
        name: createRentalItemName(name),
        availableAmount: createAvailableAmount(
          computeAvailableAmountForCompositeItem(items),
        ),
      };
    }),
  ]);

  const computeAvailableAmountForCompositeItem = (
    subItems: CompositeSubItem[],
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
      addCompositeItem(compositeItem);
    } else {
      const item = getBy(props.allItems, 'id', id);
      const defaultAmount = getDefaultAmount(item);
      _addItem(item.id, defaultAmount);
    }
  };

  const _addItem = (id: RentalItemId, amount: number) => {
    const selectedAmount = props.selectedItems[id] ?? 0;
    emit('setItem', id, selectedAmount + amount);
  };

  const addCompositeItem = (compositeItem: CompositeSubItem[]) => {
    for (const { itemId, amount } of compositeItem) {
      _addItem(itemId, amount);
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
  <SearchBar
    :available-items="availableItems"
    :placeholder="placeholder"
    @on-select="addItem">
  </SearchBar>

  <SelectionOverview
    :selected-items="selectedItems"
    @remove-item="(itemId: RentalItemId) => emit('removeItem', itemId)"
    @update-selected-item-amount="
      (itemId, amount) => emit('setItem', itemId, amount)
    ">
  </SelectionOverview>
</template>
