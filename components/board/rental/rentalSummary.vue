<script setup lang="ts">
  import type { RentalSummary } from '~/utils/gearService';

  defineProps<{ rental: RentalSummary }>();
</script>

<template>
  <div class="flex flex-row flex-wrap gap-5 justify-between items-center">
    <div>Name: {{ rental.memberName }}</div>
    <BoardRentalStatusBadge :status="rental.status" />
    <BoardRentalReturnDate :date="rental.dateReturn" />
  </div>
</template>
