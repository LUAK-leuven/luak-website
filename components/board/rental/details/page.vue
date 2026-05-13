<script setup lang="ts">
  import PaymentModal from '~/components/PaymentModal.vue';
  import type { RentalDetails } from '~/types/rental';
  import RentalItem from './rentalItem.vue';

  const props = defineProps<{
    rental: RentalDetails;
  }>();

  async function edit() {
    await navigateTo({
      name: 'board-rentals-id-return',
      params: { id: props.rental.id },
    });
  }

  const showPaymentModal = ref(false);
</script>

<template>
  <form @submit.prevent>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div v-if="rental.member" class="flex flex-col">
        <span data-testId="member.fullName">
          Member: {{ rental.member.fullName }}
        </span>
        <span v-if="rental.member.email" class="ml-3">
          ✉️:
          <SharedMailTo
            :email="rental.member.email"
            data-testId="member.email" />
        </span>
        <span v-if="rental.member.phoneNumber" class="ml-3">
          ☎️:
          <SharedWhatsappLink
            :phone-number="rental.member.phoneNumber"
            data-testId="member.phone" />
        </span>
      </div>
      <div v-if="rental.boardMember" data-testId="boardMember">
        Board member: {{ rental.boardMember }}
      </div>
      <div class="flex flex-row gap-x-1 items-center flex-wrap">
        <span>Date borrow:</span>
        <span data-testId="dateBorrow">{{ rental.dateBorrow }}</span>
      </div>
      <div class="flex flex-row gap-x-1 items-center flex-wrap">
        <span class="w-max flex-shrink-0">Return date:</span>
        <span class="flex-[44] flex-shrink">
          <BoardRentalReturnDate
            :date="rental.dateReturn"
            :ghost="rental.status === 'returned'"
            data-testId="dateReturn" />
        </span>
      </div>
      <div class="flex flex-row gap-1 items-center">
        <span>Deposit:</span>
        <span data-testId="depositFee">{{ rental.depositFee.toFixed(2) }}</span>
        <span v-if="rental.depositReturned" class="badge badge-success">
          returned
        </span>
        <button @click="showPaymentModal = true">
          <span class="material-symbols-outlined"> qr_code_scanner </span>
        </button>
      </div>
      <div data-testId="paymentMethod">Payment: {{ rental.paymentMethod }}</div>
      <div class="flex flex-row gap-1 items-center">
        <span>Status:</span>
        <BoardRentalStatusBadge :status="rental.status" data-testId="status" />
      </div>
      <div v-if="rental.comments" class="col-span-full flex flex-col">
        <span>Comments:</span>
        <p class="italic" data-testId="comments">
          {{ rental.comments }}
        </p>
      </div>
    </div>
    <hr class="my-3" />
    <div
      class="border rounded-sm grid"
      :class="'grid-cols-[3fr_1fr_1fr]'"
      data-testId="gear-and-topos-overview">
      <b class="border px-1">Gear</b>
      <b class="border px-1">Amount</b>
      <b class="border px-1">Returned amount</b>
      <RentalItem
        v-for="({ title, rentedAmount, returnedAmount }, idx) of rental.topos"
        :key="idx"
        :name="title"
        :rented-amount="rentedAmount"
        :returned-amount="returnedAmount" />
      <RentalItem
        v-for="({ name, rentedAmount, returnedAmount }, idx) of rental.gear"
        :key="idx"
        :name="name"
        :rented-amount="rentedAmount"
        :returned-amount="returnedAmount" />
    </div>
    <hr class="my-3" />
    <div class="flex justify-end gap-3">
      <button
        class="btn btn-secondary"
        data-testId="editButton"
        @click="
          () =>
            navigateTo({
              name: 'board-rentals-id-edit',
              params: { id: rental.id },
            })
        ">
        Edit
      </button>
      <button
        class="btn btn-primary"
        data-testId="returnButton"
        @click="edit()">
        Return
      </button>
    </div>
  </form>

  <PaymentModal
    :is-open="showPaymentModal"
    :amount="rental.depositFee"
    message="Deposit fee"
    @close="showPaymentModal = false" />
</template>
