<script setup lang="ts">
  definePageMeta({ middleware: 'board-member-guard' });

  const rental = ref<RentalDetails>();
  const loading = ref(true);

  onMounted(async () => {
    rental.value = await gearService().getRental(
      useRoute().params.id as string,
    );
    loading.value = false;
  });
</script>

<template>
  <FullPageCard>
    <template #subtitle>
      <h2>Rental</h2>
      <i class="text-sm">{{ rental ? rental.id : '' }}</i>
    </template>

    <NuxtLink
      class="absolute btn btn-circle btn-sm btn-outline top-10 left-10"
      to="/board/rentals">
      <span class="material-symbols-outlined"> arrow_back</span>
    </NuxtLink>

    <div class="h-2"></div>

    <div v-if="loading" class="flex justify-center">
      <span class="loading loading-spinner loading-lg" />
    </div>
    <div v-else-if="rental === undefined">ERROR!</div>
    <BoardRentalDetails v-else :rental="rental" />
  </FullPageCard>
</template>
