<script setup lang="ts">
  import dayjs from 'dayjs';
  import type { UnsavedRental } from '~/types/renal';

  definePageMeta({ middleware: 'board-member-guard' });

  const user = await useLuakMember();
  const boardMember = {
    name: user.userInfo!.first_name + ' ' + user.userInfo!.last_name,
    id: user.userInfo!.id,
  };

  const { data: allGear, pending: gearPending } =
    await gearService().getAllGearItems();
  const { data: allTopos_, pending: toposPending } =
    await gearService().getAllTopos();
  const allTopos = computed(() =>
    allTopos_.value?.map((topo) => ({
      id: topo.id,
      name: topo.title,
      totalAmount: topo.totalAmount,
      availableAmount: topo.availableAmount,
      depositFee: 500,
    })),
  );

  async function handleSubmit(state: UnsavedRental) {
    const { error, id } = await gearService().saveRental(state);
    if (!error) {
      if (id) navigateTo(`/board/rentals/${id}`);
      else navigateTo('/');
    }
    return { error };
  }
</script>

<template>
  <FullPageCard>
    <template #title>Rental form 🧗</template>

    <div v-if="gearPending || toposPending" class="flex justify-center">
      <span class="loading loading-spinner loading-lg" />
    </div>

    <div v-else-if="!allGear || !allTopos">ERROR!</div>

    <BoardRentalForm
      v-else
      :board-member="boardMember"
      :all-gear="allGear"
      :all-topos="allTopos"
      :handle-submit="handleSubmit"
      :initial-values="{
        dateBorrow: dayjs().format('YYYY-MM-DD').toString(),
        dateReturn: dayjs().add(3, 'w').format('YYYY-MM-DD').toString(),
        gear: [],
        topos: [],
      }" />

    <!-- <p>Values: {{ values }}</p>
    <p>Errors: {{ errors }}</p> -->
  </FullPageCard>
</template>
