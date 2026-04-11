<script setup lang="ts">
  import DetailsPage from '~/components/pages/DetailsPage.vue';
  import type { RentalId, RentalUpdate } from '~/types/rental';

  const { update, get } = useRentalService();

  const retnalId = useRoute().params.id as RentalId;
  const { rentals: data, pending, refresh } = await get(retnalId);

  async function updateRental(rental: RentalUpdate) {
    const { error } = await update(rental.id, rental);
    if (!error) await refresh();
    return !error;
  }
</script>

<template>
  <DetailsPage
    v-slot="{ data: rental }"
    sub-title="Rental"
    :data="data"
    :is-loading="pending"
    default-error="Failed to load rentals"
    back-to="/board/rentals">
    <BoardRentalDetails :rental="rental" :update="updateRental" />
  </DetailsPage>
</template>
