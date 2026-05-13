<script setup lang="ts">
  defineProps<{
    name: string;
    rentedAmount: number;
    returnedAmount: number;
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
      <span>{{ rentedAmount }}</span>
    </div>
    <div class="border p-1 flex flex-row items-center">
      <span data-testId="returnedAmount">{{ returnedAmount }}</span>
    </div>
  </div>
</template>
