<script lang="ts" setup>
  import type { RentalItem } from '~/types/board/form/RentaItem';

  const { allItems, compositeItems = {} } = defineProps<{
    allItems: RentalItem[];
    compositeItems?: Record<string, { itemId: string; amount: number }[]>;
    placeholder: string;
  }>();

  const emit = defineEmits<{
    computedDeposit: [value: number];
  }>();

  const model = defineModel<{ id: string; amount: number }[]>({ default: [] });

  const selectedItems = ref<
    {
      name: string;
      selectedAmount: number;
      availableAmount: number;
      totalAmount: number;
      depositFee: number;
    }[]
  >([]);

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
      itemId: string;
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
      const selectedItem = findBy(selectedItems.value, 'name', name);
      if (selectedItem === undefined) {
        selectedItems.value.push({
          name: item.name,
          selectedAmount: defaultAmount,
          availableAmount: item.availableAmount,
          totalAmount: item.totalAmount,
          depositFee: item.depositFee,
        });
      } else {
        selectedItem.selectedAmount += defaultAmount;
      }
    }
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
      model.value = selectedItem.map((it) => ({
        id: getBy(allItems, 'name', it.name).id,
        amount: it.selectedAmount,
      }));
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
    @remove-item="
      (name) =>
        (selectedItems = selectedItems.filter(
          (gearItem) => name !== gearItem.name,
        ))
    "
    @update-selected-item-amount="
      (name, amount) => {
        const gearItem = findBy(selectedItems, 'name', name);
        if (gearItem !== undefined) gearItem.selectedAmount = amount;
      }
    ">
  </BoardRentalFormItemSelectionOverview>
</template>
