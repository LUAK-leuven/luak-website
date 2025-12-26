<script lang="ts" setup>
  type GearInfo = {
    id: string;
    name: string;
    amount: number;
    depositFee: number;
  };

  const props = defineProps<{
    allGear: PublicGearInfo[];
    gearMap: Record<string, PublicGearInfo>;
    fieldName: string;
    placeholder: string;
  }>();

  const emit = defineEmits<{
    computedDepositFee: [value: number];
  }>();

  const {
    fields: selectedGear,
    push,
    remove,
  } = useFieldArray<{ id: string; amount: number }>(props.fieldName);

  const availableGearList = computed(() => {
    return props.allGear
      .filter((item) =>
        selectedGear.value.every(
          (selectedItem) => item.id !== selectedItem.value.id,
        ),
      )
      .map(
        (item) =>
          ({
            id: item.id,
            name: item.name,
            amount: item.availableAmount,
            depositFee: item.depositFee,
          }) satisfies GearInfo,
      );
  });

  function filterGear(options: GearInfo[], input: string | undefined) {
    if (input === undefined) return options;
    return options
      .filter((option) =>
        option.name.toLowerCase().includes(input.toLowerCase()),
      )
      .slice(0, 5);
  }

  function addSelection(gearItem: GearInfo) {
    push({ id: gearItem.id, amount: gearItem.name === 'quickdraw' ? 12 : 1 });
  }

  effect(() => {
    emit(
      'computedDepositFee',
      sum(
        selectedGear.value.map(
          ({ value: item }) => props.gearMap[item.id].depositFee * item.amount,
        ),
      ),
    );
  });
</script>

<template>
  <InputTextOptionsSelect
    :options="availableGearList"
    :placeholder="placeholder"
    :search-fn="filterGear"
    @selected="addSelection">
    <template #item="{ data }">
      <div
        class="p-3 rounded-md w-full flex flex-row justify-between gap-6"
        :class="
          data.amount === 0
            ? 'bg-red-100'
            : data.amount < 0
              ? 'bg-yellow-300'
              : ''
        ">
        <span>{{ data.amount < 0 ? '⚠️ ' : '' }}{{ data.name }}</span>
        <span>{{ data.amount }}</span>
      </div>
    </template>
  </InputTextOptionsSelect>

  <div class="flex flex-col gap-1">
    <div
      v-for="({ value: item }, idx) in selectedGear"
      :key="idx"
      class="p-1 rounded-2xl w-full grid grid-cols-[max-content_1fr_1fr_min-content] items-center gap-y-3 bg-stone-200"
      :class="item.amount === 0 ? 'bg-red-100' : ''">
      <span class="mx-3">
        {{ item.amount > props.gearMap[item.id].availableAmount ? '⚠️ ' : '' }}
        {{ gearMap[item.id].name }}
      </span>
      <span>
        <InputNumber
          :name="`${fieldName}[${idx}].amount`"
          :soft-max="props.gearMap[item.id].availableAmount" />
      </span>
      <div>
        Deposit: {{ (item.amount * gearMap[item.id].depositFee) / 100 }}€
      </div>
      <button
        class="btn btn-sm btn-circle btn-ghost justify-self-end mr-2"
        @click="() => remove(idx)">
        ✕
      </button>
    </div>
  </div>

  <!-- <div>
    <p>gearMap: {{ gearMap }}</p>
    <p>availableGearList: {{ availableGearList }}</p>
    <p>selected: {{ selectedGear }}</p>
  </div> -->
</template>
