<script lang="ts" setup>
  import { fuzzySearch } from '~/utils/utils';

  type GearInfo = {
    id: string;
    name: string;
    amount: number;
    depositFee: number;
  };

  const props = defineProps<{
    allGear: PublicGearInfo[];
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

  const gearMap = computed<
    Record<string, Omit<PublicGearInfo, 'id'> | undefined>
  >(() =>
    Object.fromEntries(props.allGear.map(({ id, ...rest }) => [id, rest])),
  );

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

  function filterGear(
    options: GearInfo[],
    input: string | undefined,
  ): GearInfo[] {
    if (input === undefined) return options;
    return options
      .map((option) => [option, fuzzySearch(option.name, input)] as const)
      .filter((x) => x[1] > 0)
      .sort((a, b) => b[1] - a[1])
      .map((x) => x[0]);
  }

  function addSelection(gearItem: GearInfo) {
    push({ id: gearItem.id, amount: gearItem.name === 'quickdraw' ? 12 : 1 });
  }

  effect(() => {
    emit(
      'computedDepositFee',
      sum(
        selectedGear.value.map(
          ({ value: item }) =>
            (gearMap.value[item.id]?.depositFee ?? 0) * item.amount,
        ),
      ),
    );
  });
</script>

<template>
  <InputSearchableSelect
    :options="availableGearList"
    :placeholder="placeholder"
    :search-fn="filterGear"
    @selected="addSelection">
    <template #item="{ data }">
      <div
        class="px-3 py-2 rounded-md w-full flex flex-row justify-between gap-6 shadow-sm"
        :class="
          data.amount === 0
            ? 'bg-red-100'
            : data.amount < 0
              ? 'bg-yellow-300'
              : 'bg-base-100'
        ">
        <span>{{ data.amount < 0 ? '⚠️ ' : '' }}{{ data.name }}</span>
        <span>{{ data.amount }}</span>
      </div>
    </template>
  </InputSearchableSelect>

  <div class="flex flex-col gap-1">
    <div
      v-for="({ value: item }, idx) in selectedGear"
      :key="item.id"
      class="p-1 rounded-2xl w-full grid grid-cols-[max-content_1fr_1fr_min-content] items-center gap-y-3 bg-stone-200"
      :class="item.amount === 0 ? 'bg-red-100' : ''">
      <span class="mx-3">
        {{
          item.amount > (gearMap[item.id]?.availableAmount ?? 0) ? '⚠️ ' : ''
        }}
        {{ gearMap[item.id]?.name ?? 'Error: Could not find item!' }}
      </span>
      <span>
        <InputNumber
          :name="`${fieldName}[${idx}].amount`"
          :soft-max="gearMap[item.id]?.availableAmount" />
      </span>
      <div>
        Deposit:
        {{ (item.amount * (gearMap[item.id]?.depositFee ?? 0)) / 100 }}€
      </div>
      <button
        class="btn btn-sm btn-circle btn-ghost justify-self-end mr-2"
        type="button"
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
