<script setup lang="ts">
  definePageMeta({ middleware: 'board-member-guard' });

  const route = useRoute();
  const rentalId = route.params.id as string;

  const { data: rental, pending: rentalPending } = useAsyncData(
    `rental-${rentalId}`,
    async () => await gearService().getRental(rentalId as string),
  );
  const { data: _allGear, pending: gearPending } = useAsyncData(
    'allGear',
    async () => await gearService().getPublicGearInfo(),
  );
  const { data: _allTopos, pending: toposPending } = useAsyncData(
    'allTopos',
    async () => await gearService().getAllTopos(),
  );

  const allGear = computed(() =>
    _allGear.value?.map((gearItem) => ({
      id: gearItem.id,
      name: gearItem.name,
      totalAmount: gearItem.totalAmount,
      availableAmount:
        gearItem.availableAmount +
        (rental.value?.gear.find((g) => g.gearItemId === gearItem.id)
          ?.rentedAmount ?? 0),
      depositFee: gearItem.depositFee,
    })),
  );

  const allTopos = computed(() =>
    _allTopos.value?.map((topo) => ({
      id: topo.id,
      name: topo.title,
      totalAmount: topo.totalAmount,
      availableAmount:
        topo.availableAmount +
        (rental.value?.topos.find((t) => t.topoId === topo.id)?.rentedAmount ??
          0),
      depositFee: 500,
    })),
  );

  async function handleSubmit(state: UnsavedRental) {
    if (!!rental.value) {
      for (const { gearItemId: id } of rental.value.gear) {
        if (!(id in state.gear)) {
          state.gear[id] = 0;
        }
      }
      for (const { topoId: id } of rental.value.topos) {
        if (!(id! in state.topos)) {
          state.topos[id] = 0;
        }
      }
      const success = await gearService().editRental({
        ...state,
        id: rental.value.id,
      });
      if (success) navigateTo(`/board/rentals/${rental.value.id}`);
      return { error: success ? undefined : 'Failed to save rental' };
    } else {
      return { error: 'Failed to save rental' };
    }
  }
</script>

<template>
  <FullPageCard>
    <template #title>Edit rental 🧗</template>
    <template #subtitle>
      Rental-id: <i>{{ rental?.id }}</i>
    </template>

    <NuxtLink
      class="absolute btn btn-circle btn-sm btn-outline top-10 left-10"
      to="/board/rentals">
      <span class="material-symbols-outlined">arrow_back</span>
    </NuxtLink>

    <div
      v-if="rentalPending || gearPending || toposPending"
      class="flex justify-center">
      <span class="loading loading-spinner loading-lg" />
    </div>

    <div v-else-if="!rental || !allGear || !allTopos">ERROR!</div>

    <BoardRentalForm
      v-else
      :board-member="{ id: '0000', name: rental.boardMember }"
      :all-gear="allGear"
      :all-topos="allTopos"
      :handle-submit="handleSubmit"
      :initial-values="{
        dateBorrow: rental.dateBorrow,
        dateReturn: rental.dateReturn,
        memberId: rental.member.id,
        gear: rental.gear.map((g) => ({
          id: g.gearItemId,
          amount: g.rentedAmount,
        })),
        topos: rental.topos.map((g) => ({
          id: g.topoId,
          amount: g.rentedAmount,
        })),
        depositFee: rental.depositFee,
        paymentMethod: rental.paymentMethod,
        markAsReserved: rental.status === 'reserved',
        comments: rental.comments,
      }" />
  </FullPageCard>
</template>
