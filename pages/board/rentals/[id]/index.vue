<script setup lang="ts">
  import DetailsPage from '~/components/pages/DetailsPage.vue';
  import type { RentalId } from '~/types/rental';
  import { useRentalService } from '~/composables/useRentalService';

  const retnalId = useRoute('board-rentals-id').params.id as RentalId;
  const { rental: data, pending } = await useRentalService().get(retnalId);
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
