<script setup lang="ts">
  import dayjs from 'dayjs';
  import type { UnsavedRental } from '~/types/renal';

  definePageMeta({ middleware: 'board-member-guard' });

  const popup = usePopup();

  const { data: user } = await useLuakMember();
  const boardMember = {
    name:
      user.value.userInfo!.first_name + ' ' + user.value.userInfo!.last_name,
    id: user.value.userInfo!.id,
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

  async function handleSubmit(state: Omit<UnsavedRental, 'boardMemberId'>) {
    const { error, id } = await gearService().saveRental({
      ...state,
      boardMemberId: boardMember.id,
    });
    if (!error && id) {
      popup.value = {
        type: 'success',
        message: 'Rental saved successfully!',
      };
      sleep(200);
      await navigateTo(`/board/rentals/${id}`);
      return { error: undefined };
    } else {
      popup.value = {
        type: 'error',
        message: error ?? 'An unknown error occurred.',
      };
      return { error };
    }
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
      :board-member-name="boardMember.name"
      :all-gear="allGear"
      :all-topos="allTopos"
      :handle-submit="handleSubmit"
      :initial-values="{
        dateBorrow: dayjs().format('YYYY-MM-DD').toString(),
        dateReturn: dayjs().add(3, 'w').format('YYYY-MM-DD').toString(),
      }" />
  </FullPageCard>
</template>
