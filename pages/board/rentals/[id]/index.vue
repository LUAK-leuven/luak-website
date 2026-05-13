<script setup lang="ts">
  import DetailsPage from '~/components/pages/DetailsPage.vue';
  import type { RentalId } from '~/types/rental';

  const { get } = useRentalService();

  const retnalId = useRoute().params.id as RentalId;
  const { rentals: data, pending } = await get(retnalId);
</script>

<template>
  <DetailsPage
    v-slot="{ data: rental }"
    sub-title="Rental"
    :data="data"
    :is-loading="pending"
    default-error="Failed to load rentals"
    :back-to="{ name: 'board-rentals' }">
    <BoardRentalDetailsPage :rental="rental" />
  </DetailsPage>
</template>
