<script setup lang="ts">
  import { createAvailableAmount } from '#shared/api/rest/inventory';
  import { createRentalId } from '#shared/api/rest/rental';
  import BackButton from '~/components/shared/BackButton.vue';
  import { useFetchGearAndTopos } from '~/composables/board/rental/useFetchGearAndTopos';

  const { show: showPopup } = useToast();
  const rentalId = createRentalId(useRoute('board-rentals-id-edit').params.id);

  const { get, edit } = useRentalService();

  const { rental, status: rentalStatus } = await get(rentalId);

  const {
    allGear: _allGear,
    allTopos: _allTopos,
    pending,
  } = useFetchGearAndTopos();

  const allGear = computed(() =>
    _allGear.value?.map((gearItem) => ({
      ...gearItem,
      availableAmount: createAvailableAmount(
        gearItem.availableAmount +
          (rental.value?.gear.find((g) => g.id === gearItem.id)?.rentedAmount ??
            0),
      ),
    })),
  );

  const allTopos = computed(() =>
    _allTopos.value?.map((topo) => ({
      ...topo,
      availableAmount: createAvailableAmount(
        topo.availableAmount +
          (rental.value?.topos.find((t) => t.id === topo.id)?.rentedAmount ??
            0),
      ),
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

    <BackButton
      class="absolute top-10 left-10"
      :to="{ name: 'board-rentals-id', params: { id: rentalId } }" />

    <div
      v-if="rentalStatus === 'pending' || pending"
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
                fullName: rental.contactInfo.fullName,
                email: rental.contactInfo.email,
                phone: rental.contactInfo.phoneNumber,
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
        comments: rental.comments,
      }" />
  </FullPageCard>
</template>
