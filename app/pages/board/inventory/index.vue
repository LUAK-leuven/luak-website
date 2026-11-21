<script lang="ts" setup>
  import { refDebounced } from '@vueuse/core';

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
  <FullPageCard>
    <template #title>Inventory</template>

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

      <div class="max-w-[90vw]">
        <table class="table table-zebra">
          <thead>
            <tr>
              <th>Name</th>
              <th class="px-0">Available / Total</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="gearItem of filteredGear"
              :key="gearItem.id"
              :data-testId="`gearItem-${gearItem.name}`">
              <td>
                <SharedLinkTo
                  :text="gearItem.name"
                  :to="{
                    name: 'board-gear-id',
                    params: { id: gearItem.id },
                  }"
                  data-testId="linkToDetails" />
              </td>
              <td>
                <span data-testId="availableAmount">
                  {{ gearItem.availableAmount }}
                </span>
                /
                <span data-testId="totalAmount">
                  {{ gearItem.totalAmount }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </WithLazyResource>
  </FullPageCard>
</template>
