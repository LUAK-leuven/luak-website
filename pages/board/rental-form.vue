<script setup lang="ts">
  import dayjs from 'dayjs';

  definePageMeta({ middleware: 'board-member-guard' });

  const user = await useLuakMember();
  const boardMember = {
    name: user.userInfo!.first_name + ' ' + user.userInfo!.last_name,
    id: user.userInfo!.id,
  };

  const allGear = await gearService().getPublicGearInfo();
  const allTopos = (await gearService().getAllTopos()).map((topo) => ({
    id: topo.id,
    name: topo.title,
    totalAmount: topo.totalAmount,
    availableAmount: topo.availableAmount,
    depositFee: 500,
  }));

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

    <BoardRentalForm
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
