<script setup lang="ts">
  definePageMeta({ middleware: 'board-member-guard' });

  const rentals = ref<Rental[]>();
  onMounted(async () => {
    rentals.value = await gearService().getRentals();
  });
</script>
<template>
  <FullPageCard>
    <template #title>Overview Rented Gear</template>
    <div class="flex flex-col gap-2">
      <div v-for="(rental, idx) in rentals" :key="idx">
        <BoardRental :rental="rental" />
        <hr class="my-2" />
      </div>
    </div>
  </FullPageCard>
</template>
