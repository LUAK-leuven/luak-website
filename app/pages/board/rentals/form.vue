<script setup lang="ts">
  import { useToast } from '~/composables/useToast';
  import { useRentalService } from '~/composables/useRentalService';
  import { useFetchGearAndTopos } from '~/composables/board/rental/useFetchGearAndTopos';
  import { usePaymentModal } from '~/composables/components/usePaymentModal';

  import dayjs from 'dayjs';

  const { show: showPopup } = useToast();
  const { save: saveRental } = useRentalService();

  const user = await useUserService().getUserInfo();

  const { allGear, allTopos, pending } = useFetchGearAndTopos();

  const { openPaymentModal } = usePaymentModal();

  async function handleSubmit(state: Omit<UnsavedRental, 'boardMemberId'>) {
    if (user.value === undefined) {
      showPopup('error', 'Failed to read user id.');
      return { error: 'Failed to read user id.' };
    }
    const { error, id } = await saveRental({
      ...state,
      boardMemberId: user.value.id,
    });

    if (!error && id) {
      await navigateTo({
        name: 'board-rentals-id',
        params: { id },
      });

      if (state.paymentMethod === 'transfer') {
        openPaymentModal();
      }
      showPopup('success', 'Rental saved successfully.');
      return { error: undefined };
    } else {
      showPopup('error', error ?? 'An unknown error occurred.');
      return { error };
    }
  }
</script>

<template>
  <FullPageCard>
    <template #title>Rental form 🧗</template>

    <div v-if="pending" class="flex justify-center">
      <span class="loading loading-spinner loading-lg" />
    </div>

    <div v-else-if="!allGear || !allTopos">ERROR!</div>

    <BoardRentalForm
      v-else
      :board-member-name="user?.fullName ?? 'ERROR'"
      :all-gear="allGear"
      :all-topos="allTopos"
      :handle-submit="handleSubmit"
      :initial-values="{
        dateBorrow: dayjs().format('YYYY-MM-DD').toString(),
        dateReturn: dayjs().add(3, 'w').format('YYYY-MM-DD').toString(),
      }" />
  </FullPageCard>
</template>
