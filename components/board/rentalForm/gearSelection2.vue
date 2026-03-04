<script lang="ts" setup>
  const props = defineProps<{
    allGear: PublicGearInfo[];
    compositeGear: Record<string, { itemId: string; amount: number }[]>;
  }>();

  const emit = defineEmits<{
    computedDeposit: [value: number];
  }>();

  const availableGear = computed(() =>
    props.allGear
      .filter(
        (gearItem) =>
          !selectedGear.value.some(
            (selectedItem) => selectedItem.name === gearItem.name,
          ),
      )
      .map((gearItem) => ({
        name: gearItem.name,
        availableAmount: gearItem.availableAmount,
      }))
      .concat(
        Object.entries(props.compositeGear).map(([name, items]) => ({
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
        const gearItem = props.allGear.find(
          (gearItem) => gearItem.id === itemId,
        );
        if (gearItem === undefined) throw Error('Ooopsie, its broken ...');
        return Math.floor(gearItem.availableAmount / amount);
      }),
    );

  const selectedGear = ref<
    {
      name: string;
      selectedAmount: number;
      availableAmount: number;
      totalAmount: number;
      depositFee: number;
    }[]
  >([]);

  const addGear = (name: string, defaultAmount: number = 1) => {
    const compositeGearItem = props.compositeGear[name];
    if (compositeGearItem !== undefined) {
      for (const { itemId, amount } of compositeGearItem) {
        const gearItem = getBy(props.allGear, 'id', itemId);
        addGear(gearItem.name, amount);
      }
    } else {
      const gearItem = getBy(props.allGear, 'name', name);
      selectedGear.value.push({
        name: gearItem.name,
        selectedAmount: defaultAmount,
        availableAmount: gearItem.availableAmount,
        totalAmount: gearItem.totalAmount,
        depositFee: gearItem.depositFee,
      });
    }
  };

  watch(selectedGear, (selectedGear) => {
    const depositFee = selectedGear.reduce(
      (sum, { depositFee, selectedAmount }) =>
        sum + depositFee * selectedAmount,
      0,
    );
    emit('computedDeposit', depositFee);
  });
</script>

<template>
  <BoardRentalFormGearSelectionSearchBar
    :available-gear="availableGear"
    @on-select="addGear">
  </BoardRentalFormGearSelectionSearchBar>

  <BoardRentalFormGearSelectionOverview
    :selected-gear="selectedGear"
    @remove-item="
      (name) =>
        (selectedGear = selectedGear.filter(
          (gearItem) => name !== gearItem.name,
        ))
    "
    @update-selected-item-amount="
      (name, amount) => {
        const gearItem = findBy(selectedGear, 'name', name);
        if (gearItem !== undefined) gearItem.selectedAmount = amount;
      }
    ">
  </BoardRentalFormGearSelectionOverview>
</template>
