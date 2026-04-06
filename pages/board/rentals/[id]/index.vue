<script setup lang="ts">
  import DetailsPage from '~/components/pages/DetailsPage.vue';
  import type { RentalId } from '~/types/rental';

  const retnalId = useRoute().params.id as RentalId;
  const { data, pending, error } = await gearService().getRental(retnalId);
</script>

<template>
  <DetailsPage
    v-slot="{ data: rental }"
    sub-title="Rental"
    :data="data"
    :is-loading="pending"
    :error="error?.message"
    back-to="/board/rentals">
    <BoardRentalDetails :rental="rental" />
  </DetailsPage>
</template>
