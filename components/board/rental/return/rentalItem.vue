<script setup lang="ts" generic="T extends EntityId<unknown>">
  import NumberInput from '~/components/input/Number.vue';
  import type { EntityId } from '~/types/ddd';

  defineProps<{
    name: string;
    rentedAmount: number;
    returnedAmount: number | undefined;
    bouncing: boolean | undefined;
  }>();

  const emit = defineEmits<{
    updateReturnedAmount: [returnedAmount: number];
  }>();
</script>
<template>
  <div class="contents" :data-testId="`rental-item-${name}`">
    <div
      class="border p-1 flex items-center"
      :class="
        returnedAmount === rentedAmount
          ? 'bg-green-100'
          : returnedAmount === 0
            ? 'bg-red-100'
            : 'bg-yellow-100'
      ">
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
      <div class="dropdown dropdown-end">
        <button class="btn btn-circle btn-xs btn-ghost" tabindex="0">
          <span class="material-symbols-outlined">more_vert</span>
        </button>
        <ul
          class="dropdown-content menu bg-base-100 rounded-box z-10 w-36 p-1 shadow-sm text-sm"
          tabindex="0">
          <li>
            <a class="text-error">Mark as lost</a>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
