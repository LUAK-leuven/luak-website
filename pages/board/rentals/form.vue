<script setup lang="ts">
  import dayjs from 'dayjs';
  import PaymentModal from '~/components/PaymentModal.vue';
  import type { RentalId, UnsavedRental } from '~/types/rental';

  const { show: showPopup } = usePopup();
  const showPaymentModal = ref(false);
  const paymentDetails = ref<{
    amount: number;
    name: string;
    iban: string;
    message: string;
  } | null>(null);
  const rentalId = ref<RentalId>();

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
      rentalId.value = id;
      if (state.paymentMethod === 'transfer') {
        paymentDetails.value = {
          amount: state.depositFee,
          name: 'LUAK vzw',
          iban: 'BE03 7340 3133 8584',
          message: 'Deposit fee',
        };
        showPaymentModal.value = true;
      } else {
        navigateTo(`/board/rentals/${rentalId.value}`);
      }
      showPopup('success', 'Rental saved successfully.');
      return { error: undefined };
    } else {
      showPopup('error', error ?? 'An unknown error occurred.');
      return { error };
    }
  }

  const closeModal = () => {
    showPaymentModal.value = false;
    if (rentalId.value) navigateTo(`/board/rentals/${rentalId.value}`);
  };
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

    <PaymentModal
      :is-open="showPaymentModal"
      :amount="paymentDetails?.amount ?? 0"
      :name="paymentDetails?.name ?? ''"
      :iban="paymentDetails?.iban ?? ''"
      :message="paymentDetails?.message ?? ''"
      @close="closeModal" />
  </FullPageCard>
</template>
