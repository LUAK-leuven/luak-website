<script setup lang="ts">
  import { useDebounceFn } from '@vueuse/core';
  import type { RentalDetails } from '~/utils/gearService';

  definePageMeta({
    middleware: 'board-member-guard',
    layout: false,
  });

  const rentals = ref<RentalDetails[]>();
  onMounted(async () => {
    rentals.value = await gearService().getRentals();
  });

  const searchInput = ref<string>();
  const debounceFn = useDebounceFn((value) => value, 250);
  const searchTerm = ref<string>();
  effect(async () => {
    const debounced = await debounceFn(searchInput.value);
    searchTerm.value = debounced;
  });

  const filteredRentals = computed(() => {
    const term = searchTerm.value;
    if (term !== undefined) {
      if (term.includes(':')) {
        const [key, value] = term.split(':', 2);
        let field: 'memberName' | 'boardMember' | undefined = undefined;
        switch (key) {
          case 'm':
            field = 'memberName';
            break;
          case 'b':
            field = 'boardMember';
            break;
        }
        if (field) {
          return rentals.value?.filter((rental) =>
            search(rental[field], value),
          );
        } else {
          return rentals.value?.filter(
            (rental) =>
              search(rental.boardMember, value) ||
              search(rental.memberName, value),
          );
        }
      }
      return rentals.value?.filter(
        (rental) =>
          search(rental.boardMember, term) || search(rental.memberName, term),
      );
    } else return rentals.value;
  });
</script>

<template>
  <NuxtLayout name="page-with-title">
    <template #title>Rental Overview</template>
    <InputText
      v-model="searchInput"
      class="w-full sm:w-2/3"
      type="text"
      name="search"
      placeholder="'m:' to search members"
      round />
    <div>SearchTerm: {{ searchTerm }}</div>
    <NuxtLink
      v-for="(rental, idx) in filteredRentals"
      :key="idx"
      class="bg-base-100 shadow-md w-full shrink-0 grow-0 rounded-xl px-8 py-6 md:p-5 hover:shadow-lg hover:bg-base-200 active:bg-base-300"
      :to="`/board/rentals/${rental.id}`">
      <BoardRentalSummary :rental="rental" />
    </NuxtLink>
  </NuxtLayout>
</template>
