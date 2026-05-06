<script lang="ts" setup>
  import { breakpointsTailwind, useBreakpoints } from '@vueuse/core';
  import type { Dayjs } from 'dayjs';
  import dayjs from 'dayjs';
  import RetirementDate from '~/components/board/gear/retirementDate.vue';
  import Text from '~/components/input/Text.vue';

  const { data, pending, error } = await gearService().getGearInventory();
  const searchTerm = ref<string>();

  const data_ = computed(() =>
    data.value?.map((g) => ({
      ...g,
      inventory: g.inventory.map((i) => {
        const productionDate = i.productionDate
          ? dayjs(i.productionDate)
          : undefined;
        const purchaseDate = i.purchaseDate ? dayjs(i.purchaseDate) : undefined;
        const startDate =
          purchaseDate !== undefined
            ? purchaseDate
            : productionDate !== undefined
              ? productionDate.add(1, 'year')
              : undefined;
        return {
          id: i.id,
          details: i.details,
          retirementDate: startDate?.add(g.lifespan, 'y'),
        };
      }),
    })),
  );

  const filteredGear_ = computed(() =>
    data_.value?.filter((gearItem) =>
      fuzzySearch(gearItem.name, searchTerm.value),
    ),
  );

  const getEarliesRetirementDate = (
    itemInventory: { retirementDate: Dayjs | undefined }[],
  ) => {
    return min(itemInventory, (a, b) => {
      if (a.retirementDate === undefined) return true;
      if (b.retirementDate === undefined) return false;
      return a.retirementDate.isBefore(b.retirementDate);
    });
  };

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
              <tr v-for="gearItem of filteredGear" :key="gearItem.id">
                <td>
                  <SharedLinkTo
                    :text="gearItem.name"
                    :to="{
                      name: 'board-gear-id',
                      params: { id: gearItem.id },
                    }" />
                </td>
                <td v-if="sm">
                  <RetirementDate
                    :retirement-date="
                      getEarliesRetirementDate(gearItem.inventory)
                        ?.retirementDate
                    " />
                </td>
                <td>
                  {{ gearItem.availableAmount }} / {{ gearItem.totalAmount }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </ClientOnly>
    </PagesWithLazyResource>
  </FullPageCard>
</template>
