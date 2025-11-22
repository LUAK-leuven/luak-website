<script lang="ts" setup>
  type GearInfo = {
    id: string;
    name: string;
    amount: number;
    depositFee: number;
  };

  const emits = defineEmits<{
    computedDepositFee: [value: number];
  }>();

  const allGear = await gearService().getPublicGearInfo();
  const selectedGear = ref<Record<string, GearInfo | undefined>>({});
  const selectedGearList = computed(() => {
    return Object.values(selectedGear.value).filter(
      (item) => item !== undefined,
    );
  });
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
  console.log('gear', allGear);
  const selectedGearItem = ref<GearInfo>();

  function filterGear(options: GearInfo[], input: string | undefined) {
    if (input === undefined) return options;
    return options.filter((option) => option.name.includes(input));
  }

  watch(selectedGearItem, (new_) => {
    if (new_) {
      selectedGear.value[new_.id] = {
        id: new_.id,
        name: new_.name,
        amount: new_.name === 'quickdraw' ? 6 : 1,
        depositFee: new_.depositFee,
      };
    }
  });
  effect(() => {
    emits(
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
    :show-selected-item="false">
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
        <label class="form-control max-w-24">
          <input
            v-model="selectedGear[item.id]!.amount"
            class="input input-bordered z-0"
            type="number" />
          <!-- <span class="text-error">{{ errorMessage }}</span> -->
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

  <p>Selected gear: {{ selectedGear }}</p>
  <p>Available gear: {{ remainingGear }}</p>
</template>
