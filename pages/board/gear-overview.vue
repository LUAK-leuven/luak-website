<script lang="ts" setup>
  import dayjs from 'dayjs';
  import type { GearDetails } from '~/utils/gearService';

  definePageMeta({ middleware: 'board-member-guard' });

  const isLoading = ref(true);
  const gear = ref<
    (GearDetails & {
      gearInventory: {
        retirementDate: string;
        badgeColor: string;
      }[];
    })[]
  >([]);
  const searchTerm = ref('');

  // Computed property for filtered and sorted subscriptions
  const filteredGear = computed(() => {
    return gear.value.map((gearItem) => ({
      ...gearItem,
      gearInventory: gearItem.gearInventory.filter(
        (g) =>
          g.details.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
          gearItem.name.toLowerCase().includes(searchTerm.value.toLowerCase()),
      ),
    }));
  });

  // Load data on component mount
  onMounted(async () => {
    const data = await gearService().getGearInventory();
    gear.value = data.map((gearItem) => ({
      ...gearItem,
      gearInventory: gearItem.gearInventory.map((g) => {
        const { date, color } = getRetirementDateAndBadgeColor(
          g.purchaseDate,
          g.productionDate,
          gearItem.lifespan,
        );
        return {
          ...g,
          retirementDate: date,
          badgeColor: color,
        };
      }),
    }));
    isLoading.value = false;
  });

  function getRetirementDateAndBadgeColor(
    purchaseDate: string | undefined,
    productionDate: string | undefined,
    lifespan: number,
  ): {
    date: string;
    color: string;
  } {
    const startDate =
      purchaseDate !== undefined
        ? dayjs(purchaseDate)
        : productionDate !== undefined
          ? dayjs(productionDate).add(1, 'year')
          : undefined;

    if (startDate === undefined) {
      return {
        date: '⚠',
        color: 'badge-warning',
      };
    }

    const retirementDate = startDate.add(lifespan, 'years');
    const today = dayjs().toISOString();

    const color =
      retirementDate.toISOString() <= today
        ? 'badge-error'
        : retirementDate.subtract(1, 'year').toISOString() <= today
          ? 'badge-warning'
          : 'bg-opacity-0 border-opacity-0';

    return {
      date: retirementDate.format('DD MMM YYYY').toString(),
      color,
    };
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
              <th class="pl-0">Amount</th>
              <th class="min-w-64">Details</th>
              <th>Purchase Date</th>
              <th class="pr-0">Production Date</th>
              <th>Retirement Date</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="gearItem of filteredGear" :key="gearItem.name">
              <tr v-for="g of gearItem.gearInventory" :key="g.id">
                <td class="whitespace-nowrap">
                  {{ gearItem.name }}
                </td>
                <td>{{ g.amount }}</td>
                <td>{{ g.details }}</td>
                <td>{{ g.purchaseDate }}</td>
                <td>{{ g.productionDate }}</td>
                <td>
                  <div class="flex justify-center items-center">
                    <span class="badge w-max" :class="g.badgeColor">
                      {{ g.retirementDate }}
                    </span>
                  </div>
                </td>
              </tr>
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
