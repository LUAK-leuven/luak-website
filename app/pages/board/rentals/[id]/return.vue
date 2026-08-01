<script setup lang="ts">
  import DetailsPage from '~/components/pages/DetailsPage.vue';
  import type { RentalId, RentalUpdate } from '~/types/rental';
  import { useRentalService } from '~/composables/useRentalService';

  const { update, get } = useRentalService();

  const retnalId = useRoute('board-rentals-id-return').params.id as RentalId;
  const { rental: data, pending } = await get(retnalId);

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
    :is-loading="pending"
    default-error="Failed to load rentals"
    :back-to="{ name: 'board-rentals' }">
    <BoardRentalReturnPage :rental="rental" :update="updateRental" />
  </DetailsPage>
</template>
