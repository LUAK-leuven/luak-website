<script lang="ts" setup>
  import dayjs from 'dayjs';
  import type { GearDetails } from '~/utils/gearService';

  definePageMeta({ middleware: 'board-member-guard' });

  const isLoading = ref(true);
  const gear = ref<GearDetails[]>([]);
  const searchTerm = ref('');

  // Computed property for filtered and sorted subscriptions
  const filteredGear = computed(() => {
    return gear.value.filter((sub) => {
      const matchesSearch = sub.categoryName
        .toLowerCase()
        .includes(searchTerm.value.toLowerCase());
      return matchesSearch;
    });
  });

  // Load data on component mount
  onMounted(async () => {
    gear.value = await gearService().getGearInventory();
    isLoading.value = false;
  });

  function getRetirementDate(
    purchaseDate: string | undefined,
    productionDate: string | undefined,
    lifespan: number,
  ): string {
    const date = purchaseDate === undefined ? productionDate : purchaseDate;
    if (date === undefined) return '⚠';
    return dayjs(date).add(lifespan, 'years').format('DD MMM YYYY').toString();
  }
</script>

<template>
  <FullPageCard>
    <template #title>Gear Overview </template>

    <!-- Loading state -->
    <div v-if="isLoading" class="flex justify-center items-center py-10">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <!-- Data display -->
    <div v-else>
      <!-- Filters -->
      <div class="flex flex-col md:flex-row gap-4 mb-6">
        <div class="form-control flex-1 min-w-48">
          <label class="label">
            <span class="label-text">Search by name</span>
          </label>
          <input
            v-model="searchTerm"
            class="input input-bordered w-full"
            type="text"
            placeholder="Search by name" />
        </div>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto max-w-[90vw]">
        <table class="table table-zebra">
          <thead>
            <tr>
              <th>Name</th>
              <th>Amount</th>
              <th>Details</th>
              <th>Purchase Date</th>
              <th>Production Date</th>
              <th>Retirement Date</th>
            </tr>
          </thead>
          <tbody>
            <template
              v-for="gearCat of filteredGear"
              :key="gearCat.categoryName">
              <template
                v-for="gearItem of gearCat.gearItems"
                :key="gearItem.name">
                <tr v-for="g of gearItem.gearInventory" :key="g.id">
                  <td>{{ gearItem.name }}</td>
                  <td>{{ g.amount }}</td>
                  <td>{{ g.details }}</td>
                  <td>{{ g.purchaseDate }}</td>
                  <td>{{ g.productionDate }}</td>
                  <td>
                    {{
                      getRetirementDate(
                        g.purchaseDate,
                        g.productionDate,
                        gearCat.lifespan,
                      )
                    }}
                  </td>
                </tr>
              </template>
            </template>
          </tbody>
        </table>
      </div>

      <!-- No results message -->
      <div v-if="filteredGear.length === 0" class="text-center py-10">
        <p>No gear found matching your criteria.</p>
      </div>

      <!-- {{ gear }} -->
    </div>
  </FullPageCard>
</template>
