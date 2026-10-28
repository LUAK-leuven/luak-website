<script setup lang="ts">
  import RentalsForItem from '~/components/board/inventory/RentalsForItem.vue';
  import Inventory from '~/components/board/gear/Inventory.vue';
  import DetailsPage from '~/components/pages/DetailsPage.vue';
  import {
    createGearItemId,
    type GearInventoryDetails,
  } from '#shared/api/rest/gear';

  const gearItemId = createGearItemId(useRoute('board-gear-id').params.id);

  const { data, pending, error } = useLazyFetch<GearInventoryDetails>(
    () => `/api/gear/inventory/${gearItemId}`,
    {
      method: 'get',
    },
  );

  const displayLifespan = (lifespan: number): string => {
    if (lifespan === 0) return '-';
    return `${lifespan.toFixed()} years`;
  };
</script>
<template>
  <DetailsPage
    v-slot="{ data: gearItems }"
    title="Gear Details"
    :sub-title="data?.name"
    :data="data"
    :is-loading="pending"
    :error="error?.message"
    :back-to="{ name: 'board-gear' }">
    <div class="flex flex-row flex-wrap justify-between gap-3 mt-3">
      <span data-testId="gearItem-amount">
        Available: {{ gearItems.availableAmount }} /
        {{ gearItems.totalAmount }}
      </span>
      <span> Lifespan: {{ displayLifespan(gearItems.lifespan) }} </span>
      <span>Deposit fee: {{ (gearItems.depositFee / 100).toFixed(2) }} €</span>
    </div>

    <hr class="my-3" />
    <h3 class="mb-2">Inventory</h3>
    <Inventory
      :has-infinite-lifespan="gearItems.lifespan === 0"
      :inventory="gearItems.inventory" />

    <template v-if="gearItems.rentals.length > 0">
      <hr class="my-3" />
      <RentalsForItem :rentals="gearItems.rentals" />
    </template>
  </DetailsPage>
</template>
