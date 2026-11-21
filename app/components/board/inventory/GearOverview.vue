<script lang="ts" setup>
  import { refDebounced } from '@vueuse/core';

  import RentalItemsTable from '~/components/board/inventory/RentalItemsTable.vue';
  import Text from '~/components/input/Text.vue';
  import WithLazyResource from '~/components/pages/WithLazyResource.vue';

  const { data, status, error } = useLazyFetch('/api/inventory', {
    method: 'get',
    query: { itemType: 'gear' },
  });
  const searchInput = ref<string>();
  const searchTerm = refDebounced(searchInput, 250);

  const filteredGear_ = computed(() =>
    data.value?.filter((gearItem) =>
      fuzzySearch(gearItem.name, searchTerm.value),
    ),
  );
</script>

<template>
  <Text
    v-model="searchInput"
    class="mb-2"
    label="Search by name"
    placeholder="Search by name ..." />

  <WithLazyResource
    v-slot="{ data: filteredGear }"
    :data="filteredGear_"
    :is-loading="status === 'pending'"
    :error="error?.message">
    <div v-if="filteredGear.length === 0" class="text-center py-10">
      <p>No gear found matching your criteria.</p>
    </div>

    <RentalItemsTable
      :items="filteredGear"
      :link-to-details="
        (id) => ({
          name: 'board-gear-id',
          params: { id },
        })
      " />
  </WithLazyResource>
</template>
