<script setup lang="ts">
  import NumberInput from '~/components/input/Number.vue';

  defineProps<{
    name: string;
    rentedAmount: number;
    returnedAmount: number;
    editMode: boolean;
    bouncing: boolean | undefined;
    formName: string;
  }>();

  const emit = defineEmits<{
    updateReturnedAmount: [returnedAmount: number];
  }>();
</script>
<template>
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
  <div class="border p-1 flex flex-row justify-between items-center">
    {{ rentedAmount }}
    <button
      v-if="editMode"
      class="btn btn-circle btn-xs btn-outline"
      @click="emit('updateReturnedAmount', rentedAmount)">
      <span class="material-symbols-outlined text-sm">arrow_forward</span>
    </button>
  </div>
  <div class="border p-1 flex flex-row items-center">
    <NumberInput
      v-if="editMode"
      :class="{
        'animate-bounceInput': bouncing,
      }"
      :model-value="returnedAmount"
      :text-box-color="
        returnedAmount < 0 || returnedAmount > rentedAmount ? 'input-error' : ''
      "
      @update:model-value="
        (amount) => {
          if (amount) emit('updateReturnedAmount', amount);
        }
      " />
    <span v-else>{{ returnedAmount }}</span>
  </div>
</template>
