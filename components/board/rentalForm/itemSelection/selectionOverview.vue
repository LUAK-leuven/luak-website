<script lang="ts" setup generic="T extends EntityId<unknown>">
  import type { EntityId } from '~/types/common';

  defineProps<{
    selectedItems: {
      id: T;
      name: string;
      selectedAmount: number;
      availableAmount: number;
      totalAmount: number;
      depositFee: number;
    }[];
  }>();

  const emit = defineEmits<{
    removeItem: [itemId: T];
    updateSelectedItemAmount: [itemId: T, amount: number];
  }>();
</script>

<template>
  <div class="flex flex-col gap-1">
    <div
      v-for="item in selectedItems"
      :key="item.name"
      class="p-1 rounded-2xl w-full grid grid-cols-[max-content_1fr_1fr_min-content] items-center gap-y-3 bg-stone-200"
      :class="item.selectedAmount === 0 ? 'bg-red-100' : ''">
      <span class="mx-3">
        {{ item.selectedAmount > item.availableAmount ? '⚠️ ' : '' }}
        {{ item.name }}
      </span>
      <span>
        <InputNumber2
          :text-box-color="
            item.selectedAmount <= 0 || item.selectedAmount > item.totalAmount
              ? 'input-error'
              : item.selectedAmount > item.availableAmount
                ? 'input-warning'
                : ''
          "
          :model-value="item.selectedAmount"
          @update:model-value="
            (value) => emit('updateSelectedItemAmount', item.id, value ?? 0)
          " />
      </span>
      <div>
        Deposit:
        {{ (item.selectedAmount * item.depositFee) / 100 }}€
      </div>
      <button
        class="btn btn-sm btn-circle btn-ghost justify-self-end mr-2"
        type="button"
        @click="() => emit('removeItem', item.id)">
        ✕
      </button>
    </div>
  </div>
</template>
