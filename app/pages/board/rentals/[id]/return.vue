<script setup lang="ts">
  import DetailsPage from '~/components/pages/DetailsPage.vue';

  const { update, get } = useRentalService();

  const retnalId = useRoute('board-rentals-id-return').params.id as RentalId;
  const { rental: data, status } = await get(retnalId);

  async function updateRental(rental: RentalUpdate) {
    const { error } = await update(rental.id, rental);
    return !error;
  }
</script>

<template>
  <DetailsPage
    v-slot="{ data: rental }"
    sub-title="Rental"
    :data="data"
    :is-loading="status === 'pending'"
    default-error="Failed to load rentals"
    :back-to="{ name: 'board-rentals-id', params: { id: retnalId } }">
    <BoardRentalReturnPage :rental="rental" :update="updateRental" />
  </DetailsPage>
</template>
