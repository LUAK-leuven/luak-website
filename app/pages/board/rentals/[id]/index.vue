<script setup lang="ts">
  import { createRentalId } from '#shared/api/rest/rental';
  import DetailsPage from '~/components/pages/DetailsPage.vue';

  const rentalId = createRentalId(useRoute('board-rentals-id').params.id);
  const { rental: data, status } = await useRentalService().get(rentalId);
</script>

<template>
  <DetailsPage
    v-slot="{ data: rental }"
    sub-title="Rental"
    :data="data"
    :is-loading="status === 'pending'"
    default-error="Failed to load rental"
    :back-to="{ name: 'board-rentals' }">
    <BoardRentalDetailsPage :rental="rental" />
  </DetailsPage>
</template>
