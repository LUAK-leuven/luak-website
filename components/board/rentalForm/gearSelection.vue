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

  const selectedGear = ref<Record<string, GearInfo | undefined>>({});
  const selectedGearList = computed(() => {
    return Object.values(selectedGear.value).filter(
      (item) => item !== undefined,
    );
  });

  const availableGearList = computed(() =>
    props.allGear
      .filter((item) => selectedGear.value[item.id] === undefined)
      .map(
        (item) =>
          ({
            id: item.id,
            name: item.name,
            amount: item.availableAmount,
            depositFee: item.depositFee,
          }) satisfies GearInfo,
      ),
  );

  function filterGear(options: GearInfo[], input: string | undefined) {
    if (input === undefined) return options;
    return options
      .filter((option) =>
        option.name.toLowerCase().includes(input.toLowerCase()),
      )
      .slice(0, 5);
  }

  const { value, errorMessage } = useField<Record<string, number>>(
    () => props.fieldName,
  );

  effect(() => {
    value.value = Object.fromEntries(
      selectedGearList.value.map((item) => [item.id, item.amount]),
    );
  });

  function addSelection(gearItem: GearInfo) {
    selectedGear.value[gearItem.id] = {
      id: gearItem.id,
      name: gearItem.name,
      amount: gearItem.name === 'quickdraw' ? 12 : 1,
      depositFee: gearItem.depositFee,
    };
  }

  effect(() => {
    emit(
      'computedDepositFee',
      sum(selectedGearList.value.map((item) => item.depositFee * item.amount)),
    );
  });

  function putItemBack(item: GearInfo) {
    selectedGear.value[item.id] = undefined;
  }
</script>

<template>
  <InputTextOptionsSelect
    :options="availableGearList"
    :placeholder="placeholder"
    :search-fn="filterGear"
    :show-selected-item="false"
    :error-message="errorMessage"
    @selected="addSelection">
    <template #item="{ data }">
      <div
        class="p-3 rounded-md w-full flex flex-row justify-between"
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
      v-for="item in selectedGearList"
      :key="item.id"
      class="p-1 rounded-2xl w-full grid grid-cols-[max-content_1fr_1fr_min-content] items-center gap-y-3 bg-stone-200"
      :class="item.amount === 0 ? 'bg-red-100' : ''">
      <span class="mx-3">
        {{ item.amount > props.gearMap[item.id].availableAmount ? '⚠️ ' : '' }}
        {{ item.name }}
      </span>
      <span>
        <InputNumber
          :name="`${fieldName}.${item.id}`"
          :soft-max="props.gearMap[item.id].availableAmount"
          @value-change="(value) => (item.amount = value)" />
      </span>
      <div>Deposit: {{ (item.amount * item.depositFee) / 100 }}€</div>
      <button
        class="btn btn-sm btn-circle btn-ghost justify-self-end mr-2"
        @click="() => putItemBack(item)">
        ✕
      </button>
    </div>
  </div>

  <!-- <div>
    <p>total: {{ gearMap }}</p>
    <p>availableGearList: {{ availableGearList }}</p>
    <p>selected: {{ selectedGear }}</p>
    <p>selectedList: {{ selectedGearList }}</p>
  </div> -->
</template>
