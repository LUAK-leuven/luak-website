<script setup lang="ts">
  import type { RentalId } from '~/types/renal';

  definePageMeta({ middleware: 'board-member-guard' });

  const retnalId = useRoute().params.id as RentalId;
  const {
    data: rental,
    pending,
    error,
  } = await gearService().getRental(retnalId);
</script>

<template>
  <FullPageCard>
    <template #subtitle>
      <h2>Rental</h2>
      <i class="text-sm">{{ retnalId }}</i>
    </template>

    <NuxtLink
      class="absolute btn btn-circle btn-sm btn-outline top-10 left-10"
      to="/board/rentals">
      <span class="material-symbols-outlined"> arrow_back</span>
    </NuxtLink>

    <div class="h-2"></div>

    <div v-if="pending" class="flex justify-center">
      <span class="loading loading-spinner loading-lg" />
    </div>
    <div v-else-if="!rental">ERROR: {{ error }}</div>
    <BoardRentalDetails v-else :rental="rental" />
  </FullPageCard>
</template>
