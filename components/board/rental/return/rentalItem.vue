<script setup lang="ts" generic="T extends EntityId<unknown>">
  import NumberInput from '~/components/input/Number.vue';
  import type { EntityId } from '~/types/ddd';
  import ItemMenu from './itemMenu.vue';
  import type { ItemStatus } from '~/types/board/form/RentalItem';
  import type { RentalId, RentalItemId } from '~/types/rental';

  const props = defineProps<{
    rentalId: RentalId;
    itemId: RentalItemId;
    name: string;
    rentedAmount: number;
    returnedAmount: number | undefined;
    bouncing: boolean | undefined;
  }>();

  const emit = defineEmits<{
    updateReturnedAmount: [returnedAmount: number];
  }>();

  const status = computed<ItemStatus>(() =>
    props.returnedAmount === props.rentedAmount
      ? 'returned'
      : props.returnedAmount === 0
        ? 'not-returned'
        : 'partially-returned',
  );

  const bgColor = computed(() => {
    switch (status.value) {
      case 'returned':
        return 'bg-green-100';
      case 'not-returned':
        return 'bg-red-100';
      case 'partially-returned':
        return 'bg-yellow-100';
      default:
        return '';
    }
  });
</script>
<template>
  <div class="contents" :data-testId="`rental-item-${name}`">
    <div class="border p-1 flex items-center" :class="bgColor">
      {{ name }}
    </div>
    <div
      class="border p-1 flex flex-row justify-between items-center"
      data-testId="rentedAmount">
      <button
        class="btn btn-circle btn-xs btn-outline"
        data-testId="quickReturn"
        @click="emit('updateReturnedAmount', rentedAmount)">
        <span class="material-symbols-outlined text-sm">arrow_forward</span>
      </button>
    </div>
    <div class="border p-1 flex flex-row items-center">
      <NumberInput
        :class="{
          'animate-bounceInput': bouncing,
        }"
        :model-value="returnedAmount"
        :text-box-color="
          returnedAmount === undefined ||
          returnedAmount < 0 ||
          returnedAmount > rentedAmount
            ? 'input-error'
            : ''
        "
        data-testId="returnedAmountInput"
        @update:model-value="
          (amount) => {
            if (amount !== undefined) emit('updateReturnedAmount', amount);
          }
        ">
        <template #label-end>
          <span class="m-0 w-max"> / {{ rentedAmount }}</span>
        </template>
      </NumberInput>
    </div>
    <div class="border p-1 flex items-center justify-center">
      <ItemMenu :item-id="itemId" :rental-id="rentalId" />
    </div>
  </div>
</template>
