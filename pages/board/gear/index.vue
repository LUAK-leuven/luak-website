<script lang="ts" setup>
  definePageMeta({ middleware: 'board-member-guard' });

  const { data: gear, pending, error } = await gearService().getAllGearItems();
  const searchTerm = ref<string>();

  const filteredGear_ = computed(() =>
    gear.value?.filter((gearItem) =>
      fuzzySearch(gearItem.name, searchTerm.value),
    ),
  );
</script>

<template>
  <FullPageCard>
    <template #title>Gear Overview </template>

    <PagesWithLazyResource
      v-slot="{ data: filteredGear }"
      :data="filteredGear_"
      :is-loading="pending"
      :error="error?.message">
      <InputText2
        v-model="searchTerm"
        label="Search by name"
        placeholder="Search by name ..." />

      <div v-if="filteredGear.length === 0" class="text-center py-10">
        <p>No gear found matching your criteria.</p>
      </div>

      <div v-else class="overflow-x-auto max-w-[90vw]">
        <table class="table table-zebra">
          <thead>
            <tr>
              <th>Name</th>
              <th class="px-0">Available / Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="gearItem of filteredGear" :key="gearItem.id">
              <td class="whitespace-nowrap">
                <SharedLinkTo
                  :text="gearItem.name"
                  :to="`/board/gear/${gearItem.id}`" />
              </td>
              <td>
                {{ gearItem.availableAmount }} / {{ gearItem.totalAmount }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </PagesWithLazyResource>
  </FullPageCard>
</template>
