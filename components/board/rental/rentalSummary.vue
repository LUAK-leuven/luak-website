<script setup lang="ts">
  import type { RentalDetails } from '~/utils/gearService';

  defineProps<{ rental: RentalDetails }>();
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
    <div>Name: {{ rental.memberName }}</div>
    <BoardRentalReturnDate :date="rental.dateReturn" />
  </div>
</template>
