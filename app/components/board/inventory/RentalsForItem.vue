<script setup lang="ts">
  defineProps<{
    rentals: {
      id: EntityId<unknown>;
      memberName: string;
      rentedAmount: number;
    }[];
  }>();
</script>
<template>
  <h3 class="mb-2">Rentals</h3>
  <div class="grid grid-cols-[3fr_1fr] border rounded-sm overflow-x-scroll">
    <b class="border px-1">Name</b>
    <b class="border px-1">Amount</b>
    <template v-for="{ id, memberName, rentedAmount } of rentals" :key="id">
      <SharedLinkTo
        class="border p-1"
        :text="memberName"
        :to="{ name: 'board-rentals-id', params: { id } }" />
      <div class="border p-1">{{ rentedAmount }}</div>
    </template>
  </div>
</template>
