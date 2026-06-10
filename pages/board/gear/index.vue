<script lang="ts" setup>
  import { breakpointsTailwind, useBreakpoints } from '@vueuse/core';
  import dayjs from 'dayjs';
  import RetirementDate from '~/components/board/gear/retirementDate.vue';
  import Text from '~/components/input/Text.vue';

  const { data, pending, error } = useLazyFetch('/api/gear/inventory', {
    method: 'get',
  });
  const searchTerm = ref<string>();

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
    <template #title>Gear Overview </template>

    <PagesWithLazyResource
      v-slot="{ data: filteredGear }"
      :data="filteredGear_"
      :is-loading="pending"
      :error="error?.message">
      <Text
        v-model="searchTerm"
        label="Search by name"
        placeholder="Search by name ..." />

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
                    :retirement-date="
                      gearItem.earliestRetirementDate
                        ? dayjs(gearItem.earliestRetirementDate)
                        : undefined
                    " />
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
    </PagesWithLazyResource>
  </FullPageCard>
</template>
