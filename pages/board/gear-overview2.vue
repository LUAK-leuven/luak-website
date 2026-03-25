<script lang="ts" setup>
  definePageMeta({ middleware: 'board-member-guard' });

  const { data: gear, pending } = await gearService().getInventory2();
  const searchTerm = ref('');

  const filteredGear = computed(() =>
    gear.value?.filter((gearItem) =>
      gearItem.name.toLowerCase().includes(searchTerm.value.toLowerCase()),
    ),
  );
</script>

<template>
  <FullPageCard>
    <template #title>Gear Overview </template>

    <div v-if="pending" class="flex justify-center items-center py-10">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <div v-else-if="!filteredGear">ERROR!</div>

    <div v-else>
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

      <div class="flex flex-row flex-wrap justify-evenly gap-3">
        <div
          v-for="gearItem of gear"
          :key="gearItem.id"
          class="card border shadow w-96">
          <div class="card-body">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="flex flex-row gap-1">
                <h3 class="mt-0">{{ gearItem.name }}</h3>
                <span class="material-symbols-outlined text-lg">
                  open_in_new
                </span>
              </div>
              <div>
                Available: {{ gearItem.availableAmount }} /
                {{ gearItem.totalAmount }}
              </div>
            </div>

            <hr class="my-3" />
            <b>Inventory</b>
            <div
              class="grid grid-cols-[3fr_1fr] border rounded-sm overflow-x-scroll">
              <b class="border px-1">Details</b>
              <b class="border px-1">Amount</b>
              <template
                v-for="{ id, details, amount, status } of gearItem.inventory"
                :key="id">
                <div
                  class="border p-1"
                  :class="{ 'bg-base-200': status === 'archived' }">
                  {{ details }}
                </div>
                <div
                  class="border p-1"
                  :class="{ 'bg-base-200': status === 'archived' }">
                  {{ amount }}
                </div>
              </template>
            </div>

            <template v-if="gearItem.rentals.length > 0">
              <hr class="my-3" />
              <b>Rentals</b>
              <div
                class="grid grid-cols-[3fr_1fr] border rounded-sm overflow-x-scroll">
                <b class="border px-1">Name</b>
                <b class="border px-1">Amount</b>
                <template
                  v-for="{ id, memberName, amount } of gearItem.rentals"
                  :key="id">
                  <NuxtLink class="border p-1" :to="`/board/rentals/${id}`">
                    {{ memberName }}
                    <span class="material-symbols-outlined text-lg">
                      open_in_new
                    </span>
                  </NuxtLink>
                  <div class="border p-1">{{ amount }}</div>
                </template>
              </div>
            </template>
          </div>
        </div>
      </div>

      <div v-if="filteredGear.length === 0" class="text-center py-10">
        <p>No gear found matching your criteria.</p>
      </div>

      <!-- {{ gear }} -->
    </div>
  </FullPageCard>
</template>
