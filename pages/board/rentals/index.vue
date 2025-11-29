<script setup lang="ts">
  import { useDebounceFn } from '@vueuse/core';
  import type { RentalSummary } from '~/utils/gearService';

  definePageMeta({
    middleware: 'board-member-guard',
    layout: false,
  });

  const rentals = ref<RentalSummary[]>();
  onMounted(async () => {
    rentals.value = await gearService().getRentals();
    rentals.value.sort((a, b) => {
      if (a.status === b.status) return 0;
      if (b.status === 'returned') return -1;
      return 1;
    });
    rentals.value.sort((a, b) => {
      if (a.dateReturn === b.dateReturn) return 0;
      if (a.dateReturn < b.dateReturn) return -1;
      return 1;
    });
  });

  const searchInput = ref<string>();
  const debounceFn = useDebounceFn((value) => value, 250);
  const searchTerm = ref<string>();
  effect(async () => {
    const debounced = await debounceFn(searchInput.value);
    searchTerm.value = debounced;
  });
  const showReturned = ref<boolean>();

  const filteredRentals = computed(() => {
    const selectedRentals = showReturned.value
      ? rentals.value
      : rentals.value?.filter(
          (rental) =>
            rental.status === 'not_returned' ||
            rental.status === 'partially_returned',
        );
    if (selectedRentals === undefined) return undefined;
    const term = searchTerm.value;
    if (term === undefined) return selectedRentals;

    if (term.includes(':')) {
      const [key, value] = term.split(':', 2);
      let field: 'memberName' | undefined = undefined;
      switch (key) {
        case 'm':
          field = 'memberName';
          break;
      }
      if (field) {
        return selectedRentals.filter((rental) => search(rental[field], value));
      } else {
        return selectedRentals.filter((rental) =>
          search(rental.memberName, value),
        );
      }
    }
    return selectedRentals.filter((rental) => search(rental.memberName, term));
  });
</script>

<template>
  <NuxtLayout name="page-with-title">
    <template #title>Rental Overview</template>
    <form class="flex flex-row w-full sm:w-2/3 items-center gap-3 mb-5">
      <InputText
        v-model="searchInput"
        class="w-full"
        type="text"
        name="search"
        placeholder="'m:' to search members"
        round />
      <div class="flex flex-col items-center">
        <label class="italic text-xs w-max" for="showReturned">
          show returned
        </label>
        <input
          id="showReturned"
          v-model="showReturned"
          class="toggle toggle-lg toggle-primary"
          type="checkbox" />
      </div>
    </form>
    <span
      v-if="rentals === undefined"
      class="loading loading-dots loading-lg"></span>
    <NuxtLink
      v-for="rental in filteredRentals"
      :key="rental.id"
      class="bg-base-100 shadow-md w-full shrink-0 grow-0 rounded-xl px-8 py-6 md:p-5 hover:shadow-lg hover:bg-base-200 active:bg-base-300"
      :to="`/board/rentals/${rental.id}`">
      <BoardRentalSummary :rental="rental" />
    </NuxtLink>
  </NuxtLayout>
</template>
