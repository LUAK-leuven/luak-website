<script setup lang="ts">
  import type { RentalDetails } from '~/utils/gearService';

  defineProps<{ rental: RentalDetails }>();
</script>

<template>
  <div class="flex flex-row flex-wrap gap-5 justify-evenly">
    <div>Name: {{ rental.memberName }}</div>
    <BoardRentalReturnDate :date="rental.dateReturn" />
  </div>
</template>
