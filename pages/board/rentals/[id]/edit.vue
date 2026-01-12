<script setup lang="ts">
  definePageMeta({ middleware: 'board-member-guard' });

  const rental = ref<RentalDetails>();
  const allGear = ref<PublicGearInfo[]>();
  const allTopos = ref<PublicGearInfo[]>();
  const loading = ref(true);

  async function handleSubmit(state: UnsavedRental) {
    if (rental.value !== undefined) {
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

  onMounted(async () => {
    rental.value = await gearService().getRental(
      useRoute().params.id as string,
    );

    allGear.value = (await gearService().getPublicGearInfo()).map(
      (gearItem) => ({
        id: gearItem.id,
        name: gearItem.name,
        totalAmount: gearItem.totalAmount,
        availableAmount:
          gearItem.availableAmount +
          (rental.value?.gear.find((g) => g.gearItemId === gearItem.id)
            ?.rentedAmount ?? 0),
        depositFee: gearItem.depositFee,
      }),
    );
    allTopos.value = (await gearService().getAllTopos()).map((topo) => ({
      id: topo.id,
      name: topo.title,
      totalAmount: topo.totalAmount,
      availableAmount:
        topo.availableAmount +
        (rental.value?.topos.find((t) => t.topoId === topo.id)?.rentedAmount ??
          0),
      depositFee: 500,
    }));

    loading.value = false;
  });
</script>

<template>
  <FullPageCard>
    <template #title>Edit rental 🧗</template>
    <template #subtitle>
      Rental-id: <i>{{ rental?.id }}</i>
    </template>

    <div v-if="loading" class="flex justify-center">
      <span class="loading loading-spinner loading-lg" />
    </div>

    <div
      v-else-if="
        rental === undefined || allGear === undefined || allTopos === undefined
      ">
      ERROR!
    </div>

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
          id: g.gearItemId ?? 'error',
          amount: g.rentedAmount,
        })),
        topos: rental.topos.map((g) => ({
          id: g.topoId ?? 'error',
          amount: g.rentedAmount,
        })),
        depositFee: rental.depositFee,
        paymentMethod: rental.paymentMethod,
        markAsReserved: rental.status === 'reserved',
        comments: rental.comments,
      }" />

    <!-- <p>Values: {{ values }}</p>
    <p>Errors: {{ errors }}</p> -->
  </FullPageCard>
</template>
