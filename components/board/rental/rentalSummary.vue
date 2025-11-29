<script setup lang="ts">
  import type { RentalSummary } from '~/utils/gearService';

  defineProps<{ rental: RentalSummary }>();
</script>

<template>
  <div class="flex flex-row flex-wrap gap-5 justify-between items-center">
    <div>Name: {{ rental.memberName }}</div>
    <BoardRentalStatusBadge :status="rental.status" />
    <div>
      <BoardRentalReturnDate :date="rental.dateBorrow" :ghost="true" />
      <span class="mr-1">→</span>
      <BoardRentalReturnDate
        :date="rental.dateReturn"
        :ghost="rental.status === 'returned'" />
    </div>
  </div>
</template>
