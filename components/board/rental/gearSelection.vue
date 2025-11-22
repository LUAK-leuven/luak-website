<script lang="ts" setup>
  type GearInfo = {
    id: string;
    name: string;
    amount: number;
    depositFee: number;
  };

  const emit = defineEmits<{
    computedDepositFee: [value: number];
  }>();

  // const model = defineModel<{
  //   gearList: { id: string; amount: number }[];
  //   depositFee: number;
  // }>({ required: true });

  const allGear = await gearService().getPublicGearInfo();
  const selectedGear = ref<Record<string, GearInfo | undefined>>({});
  const selectedGearList = computed(() => {
    return Object.values(selectedGear.value).filter(
      (item) => item !== undefined,
    );
  });
  // effect(() => {
  //   model.value.gearList = selectedGearList.value;
  // });
  const availableGearList = computed(() =>
    allGear
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
  const remainingGear: ComputedRef<Record<string, GearInfo>> = computed(() =>
    Object.fromEntries(
      allGear.map((item) => [
        item.id,
        {
          id: item.id,
          name: item.name,
          amount:
            item.availableAmount - (selectedGear.value[item.id]?.amount ?? 0),
          depositFee: item.depositFee,
        },
      ]),
    ),
  );
  const selectedGearItem = ref<GearInfo>();

  function filterGear(options: GearInfo[], input: string | undefined) {
    if (input === undefined) return options;
    return options.filter((option) => option.name.includes(input));
  }

  const { value, errorMessage } = useField<{ id: string; amount: number }[]>(
    () => 'gear',
  );

  effect(() => {
    value.value = selectedGearList.value.map((item) => ({
      id: item.id,
      amount: item.amount,
    }));
  });

  effect(() => {
    if (selectedGearItem.value) {
      selectedGear.value[selectedGearItem.value.id] = {
        id: selectedGearItem.value.id,
        name: selectedGearItem.value.name,
        amount: selectedGearItem.value.name === 'quickdraw' ? 6 : 1,
        depositFee: selectedGearItem.value.depositFee,
      };
    }
  });
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
    v-model="selectedGearItem"
    :options="availableGearList"
    placeholder="select gear"
    :options-select-fn="filterGear"
    :show-selected-item="false"
    :error-message="errorMessage">
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
        {{ remainingGear[item.id].amount < 0 ? '⚠️ ' : '' }}
        {{ item.name }}
      </span>
      <span>
        <label class="form-control max-w-20 sm:max-w-24">
          <input
            v-model="selectedGear[item.id]!.amount"
            class="input input-bordered"
            type="number"
            @focusout="
              if (selectedGear[item.id]!.amount < 0)
                selectedGear[item.id]!.amount = 0;
            " />
        </label>
      </span>
      <div>Deposit: {{ (item.amount * item.depositFee) / 100 }}€</div>
      <button
        class="btn btn-sm btn-circle btn-ghost justify-self-end mr-2"
        @click="() => putItemBack(item)">
        ✕
      </button>
    </div>
  </div>
</template>
