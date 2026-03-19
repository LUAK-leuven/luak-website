<script setup lang="ts">
  import type { RentalId, UnsavedRental } from '~/types/renal';
  import { computeRentalStatus } from '~/utils/rental/computeStatus';

  definePageMeta({ middleware: 'board-member-guard' });

  const popup = usePopup();
  const route = useRoute();
  const rentalId = route.params.id as RentalId;

  const { data: rental, pending: rentalPending } =
    await gearService().getRental(rentalId);
  const { data: _allGear, pending: gearPending } =
    await gearService().getAllGearItems();
  const { data: _allTopos, pending: toposPending } =
    await gearService().getAllTopos();

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

  async function handleSubmit(state: Omit<UnsavedRental, 'boardMemberId'>) {
    if (!!rental.value) {
      for (const { gearItemId: id } of rental.value.gear) {
        if (!state.gear[id]) {
          state.gear[id] = 0;
        }
      }
      for (const { topoId: id } of rental.value.topos) {
        if (!state.topos[id]) {
          state.topos[id] = 0;
        }
      }
      state.status =
        state.status === 'reserved'
          ? 'reserved'
          : computeRentalStatus(
              state.gear,
              Object.fromEntries(
                rental.value.gear.map((g) => [g.gearItemId, g.returnedAmount]),
              ),
              state.topos,
              Object.fromEntries(
                rental.value.topos.map((t) => [t.topoId, t.returnedAmount]),
              ),
              rental.value.depositReturned,
            );
      const error = await gearService().editRental({
        ...state,
        id: rental.value.id,
      });
      if (!error) {
        popup.value = {
          type: 'success',
          message: 'Rental saved successfully!',
        };
        sleep(200);
        await navigateTo(`/board/rentals/${rental.value.id}`);
        return { error: undefined };
      } else {
        popup.value = {
          type: 'error',
          message:
            "[500]: Failed to save rental. Stuff is broken, maybe you're not connected to the internet.",
        };
        return { error: 'Failed to save rental' };
      }
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
      :board-member-name="rental.boardMember"
      :all-gear="allGear"
      :all-topos="allTopos"
      :handle-submit="handleSubmit"
      :initial-values="{
        dateBorrow: rental.dateBorrow,
        dateReturn: rental.dateReturn,
        memberId: rental.memberId ?? 'non-user',
        contactInfo: rental.memberId === undefined ? rental.member : undefined,
        gear: Object.fromEntries(
          rental.gear.map((it) => [it.gearItemId, it.rentedAmount]),
        ),
        topos: Object.fromEntries(
          rental.topos.map((it) => [it.topoId, it.rentedAmount]),
        ),
        depositFee: rental.depositFee,
        paymentMethod: rental.paymentMethod,
        markAsReserved: rental.status === 'reserved',
        comments: rental.comments,
      }" />
  </FullPageCard>
</template>
