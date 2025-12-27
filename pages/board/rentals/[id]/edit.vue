<script setup lang="ts">
  definePageMeta({ middleware: 'board-member-guard' });

  const rental = ref<RentalDetails>();
  const loading = ref(true);

  const allGear = await gearService().getPublicGearInfo();
  const allTopos = (await gearService().getAllTopos()).map((topo) => ({
    id: topo.id,
    name: topo.title,
    totalAmount: topo.totalAmount,
    availableAmount: topo.availableAmount,
    depositFee: 500,
  }));

  async function handleSubmit(state: UnsavedRental) {
    return { error: 'not implemented' };
  }

  onMounted(async () => {
    rental.value = await gearService().getRental(
      useRoute().params.id as string,
    );
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

    <div v-else-if="rental === undefined">ERROR!</div>

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
      }" />

    <!-- <p>Values: {{ values }}</p>
    <p>Errors: {{ errors }}</p> -->
  </FullPageCard>
</template>
