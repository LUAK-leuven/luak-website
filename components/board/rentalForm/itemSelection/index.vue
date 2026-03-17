<script lang="ts" setup generic="T extends EntityId<unknown>">
  import type { RentalItem } from '~/types/board/form/RentalItem';
  import type { EntityId } from '~/types/common';

  const { allItems, compositeItems = {} } = defineProps<{
    allItems: RentalItem<T>[];
    compositeItems?: Record<string, { itemId: T; amount: number }[]>;
    placeholder: string;
  }>();

  const emit = defineEmits<{
    computedDeposit: [value: number];
  }>();

  const model = defineModel<{ id: T; amount: number }[]>({
    default: [],
  });

  const selectedItems = computed(() =>
    model.value.map((it) => {
      const item = getBy(allItems, 'id', it.id);
      return {
        id: it.id,
        name: item.name,
        selectedAmount: it.amount,
        availableAmount: item.availableAmount,
        totalAmount: item.totalAmount,
        depositFee: item.depositFee,
      };
    }),
  );

  const availableItems = computed(() =>
    allItems
      .filter(
        (it) =>
          !selectedItems.value.some(
            (selectedItem) => selectedItem.name === it.name,
          ),
      )
      .map((it) => ({
        name: it.name,
        availableAmount: it.availableAmount,
      }))
      .concat(
        Object.entries(compositeItems).map(([name, items]) => ({
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
        const item = getBy(allItems, 'id', itemId);
        return Math.floor(item.availableAmount / amount);
      }),
    );

  const getDefaultByItemName = (name: string) =>
    name === 'quickdraw' ? 12 : 1;

  const addItem = (
    name: string,
    defaultAmount: number = getDefaultByItemName(name),
  ) => {
    const compositeItem = compositeItems[name];
    if (compositeItem !== undefined) {
      for (const { itemId, amount } of compositeItem) {
        const item = getBy(allItems, 'id', itemId);
        addItem(item.name, amount);
      }
    } else {
      const item = getBy(allItems, 'name', name);
      const selectedItem = findBy(model.value, 'id', item.id);
      if (selectedItem === undefined) {
        model.value = [
          ...model.value,
          {
            id: item.id,
            amount: defaultAmount,
          },
        ];
      } else {
        selectedItem.amount += defaultAmount;
      }
    }
  };

  const removeItem = (itemId: T) => {
    model.value = model.value.filter((it) => itemId !== it.id);
  };

  const updateItem = (itemId: T, amount: number) => {
    model.value = model.value.map((it) =>
      it.id === itemId ? { id: it.id, amount: amount } : it,
    );
  };

  watch(
    selectedItems,
    (selectedItem) => {
      const depositFee = selectedItem.reduce(
        (sum, { depositFee, selectedAmount }) =>
          sum + depositFee * selectedAmount,
        0,
      );
      emit('computedDeposit', depositFee);
    },
    { deep: true },
  );
</script>

<template>
  <BoardRentalFormItemSelectionSearchBar
    :available-items="availableItems"
    :placeholder="placeholder"
    @on-select="addItem">
  </BoardRentalFormItemSelectionSearchBar>

  <BoardRentalFormItemSelectionOverview
    :selected-items="selectedItems"
    @remove-item="removeItem"
    @update-selected-item-amount="updateItem">
  </BoardRentalFormItemSelectionOverview>
</template>
