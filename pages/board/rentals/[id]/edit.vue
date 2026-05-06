<script setup lang="ts">
  import type { RentalId, UnsavedRental } from '~/types/rental';
  import { computeRentalStatus } from '~/utils/rental/computeStatus';
  import { useToast } from '~/composables/useToast';

  const { show: showPopup } = useToast();
  const route = useRoute();
  const rentalId = route.params.id as RentalId;

  const { get, edit } = useRentalService();

  const { rentals: rental, pending: rentalPending } = await get(rentalId);
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
        (rental.value?.gear.find((g) => g.id === gearItem.id)?.rentedAmount ??
          0),
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
        (rental.value?.topos.find((t) => t.id === topo.id)?.rentedAmount ?? 0),
      depositFee: 500,
    })),
  );

  async function handleSubmit(state: Omit<UnsavedRental, 'boardMemberId'>) {
    if (rental.value) {
      for (const { id } of rental.value.gear) {
        if (!state.gear[id]) {
          state.gear[id] = 0;
        }
      }
      for (const { id } of rental.value.topos) {
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
                rental.value.gear.map((g) => [g.id, g.returnedAmount]),
              ),
              state.topos,
              Object.fromEntries(
                rental.value.topos.map((t) => [t.id, t.returnedAmount]),
              ),
              rental.value.depositReturned,
            );
      const { error } = await edit(rentalId, state);
      if (!error) {
        showPopup('success', 'Rental saved successfully!');
        await navigateTo({
          name: 'board-rentals-id',
          params: { id: rentalId },
        });
        return { error: undefined };
      } else {
        showPopup(
          'error',
          "[500]: Failed to save rental. Stuff is broken, maybe you're not connected to the internet.",
        );
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

    <SharedBackButton
      :to="{ name: 'board-rentals-id', params: { id: rentalId } }" />

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
        contactInfo:
          rental.memberId === undefined
            ? {
                fullName: rental.member.fullName,
                email: rental.member.email,
                phone: rental.member.phoneNumber,
              }
            : undefined,
        gear: Object.fromEntries(
          rental.gear.map((it) => [it.id, it.rentedAmount]),
        ),
        topos: Object.fromEntries(
          rental.topos.map((it) => [it.id, it.rentedAmount]),
        ),
        depositFee: rental.depositFee,
        paymentMethod: rental.paymentMethod,
        markAsReserved: rental.status === 'reserved',
        comments: rental.comments,
      }" />
  </FullPageCard>
</template>
