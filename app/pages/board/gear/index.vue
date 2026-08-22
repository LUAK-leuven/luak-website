<script lang="ts" setup>
  import {
    breakpointsTailwind,
    refDebounced,
    useBreakpoints,
  } from '@vueuse/core';
  import RetirementDate from '~/components/board/gear/retirementDate.vue';
  import Text from '~/components/input/Text.vue';
  import WithLazyResource from '~/components/pages/WithLazyResource.vue';

  const { data, status, error } = useLazyFetch('/api/gear/inventory', {
    method: 'get',
  });
  const searchInput = ref<string>();
  const searchTerm = refDebounced(searchInput, 250);

  const filteredGear_ = computed(() =>
    data.value?.filter((gearItem) =>
      fuzzySearch(gearItem.name, searchTerm.value),
    ),
  );

  const bp = useBreakpoints(breakpointsTailwind);
  const sm = computed(() => bp.sm.value);
</script>

<template>
  <FullPageCard>
    <template #title>Gear Overview</template>

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

      <ClientOnly v-else>
        <div class="max-w-[90vw]">
          <table class="table table-zebra">
            <thead>
              <tr>
                <th>Name</th>
                <th v-if="sm">Earliest retirement date</th>
                <th class="px-0">Available / Total</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="gearItem of filteredGear"
                :key="gearItem.id"
                :data-testid="`gearItem-${gearItem.name}`">
                <td>
                  <SharedLinkTo
                    :text="gearItem.name"
                    :to="{
                      name: 'board-gear-id',
                      params: { id: gearItem.id },
                    }"
                    data-testid="linkToDetails" />
                </td>
                <td v-if="sm">
                  <RetirementDate
                    :retirement-date="gearItem.earliestRetirementDate" />
                </td>
                <td>
                  <span data-testid="availableAmount">
                    {{ gearItem.availableAmount }}
                  </span>
                  /
                  <span data-testid="totalAmount">
                    {{ gearItem.totalAmount }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </ClientOnly>
    </WithLazyResource>
  </FullPageCard>
</template>
