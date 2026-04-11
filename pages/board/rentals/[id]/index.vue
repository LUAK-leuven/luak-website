<script setup lang="ts">
  import DetailsPage from '~/components/pages/DetailsPage.vue';
  import type { RentalId } from '~/types/rental';

  const retnalId = useRoute().params.id as RentalId;
  const { rentals: data, pending } = await useRentalService().get(retnalId);
</script>

<template>
  <DetailsPage
    v-slot="{ data: rental }"
    sub-title="Rental"
    :data="data"
    :is-loading="pending"
    default-error="Failed to load rentals"
    back-to="/board/rentals">
    <BoardRentalDetails :rental="rental" />
  </DetailsPage>
</template>
