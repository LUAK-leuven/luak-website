<script setup lang="ts">
  import ReturnDate from '~/components/board/rental/returnDate.vue';
  import StatusBadge from '~/components/board/rental/statusBadge.vue';
  import type { RentalDetails } from '~/utils/gearService';

  const rental = ref<RentalDetails>();
  const loading = ref(true);
  const rentalUpdate = ref<{
    dateReturn: string;
    depositFee: number;
    gear: {
      returnedAmount: number;
    }[];
  }>();

  onMounted(async () => {
    rental.value = await gearService().getRental(
      useRoute().params.id as string,
    );
    loading.value = false;

    if (rental.value !== undefined) {
      rentalUpdate.value = {
        dateReturn: rental.value.dateReturn,
        depositFee: rental.value.depositFee,
        gear: rental.value.gear.map((gearItem) => ({
          returnedAmount: gearItem.rentedAmount - gearItem.actualAmount,
        })),
      };
    }
  });

  const editMode = ref(false);

  function markReturned() {
    editMode.value = true;
    if (rental.value!.status === 'not_returned') {
      rentalUpdate.value!.gear = rental.value!.gear.map((gearItem) => ({
        returnedAmount: gearItem.rentedAmount,
      }));
      rental.value!.status = 'returned';
    }
    // TODO: input validation
    // TODO: Persist changes
  }
</script>

<template>
  <FullPageCard>
    <template #subtitle><h2>title?</h2></template>
    <div class="h-2"></div>
    <div v-if="loading" class="flex justify-center">
      <span class="loading loading-spinner loading-lg" />
    </div>
    <div v-else-if="rental === undefined">ERROR!</div>
    <div v-else>
      <div class="grid grid-cols-2 gap-3">
        <div>Member: {{ rental.memberName }}</div>
        <div>Board member: {{ rental.boardMember }}</div>
        <div class="flex flex-row gap-x-1 items-center flex-wrap">
          <span>Date borrow:</span>
          <span>{{ rental.dateBorrow }}</span>
        </div>
        <div class="flex flex-row gap-x-1 items-center flex-wrap">
          <span class="w-max flex-shrink-0">Return date:</span>
          <span class="flex-[44] flex-shrink">
            <InputText
              v-if="editMode"
              v-model="rentalUpdate!.dateReturn"
              name="dateReturn"
              type="date" />
            <ReturnDate v-else :date="rentalUpdate!.dateReturn" />
          </span>
        </div>
        <div class="flex flex-row gap-1 items-center">
          <span>Deposit:</span>
          <InputNumber
            v-if="editMode"
            v-model="rentalUpdate!.depositFee"
            :clamp-input="true"
            :hard-min="0"
            :soft-max="rental.depositFee" />
          <span v-else>{{ rental.depositFee }}</span>
        </div>
        <div>Payment: {{ rental.paymentMethod }}</div>
        <div class="flex flex-row gap-1 items-center">
          <span>Status:</span>
          <select
            v-if="editMode"
            class="select select-bordered w-full max-w-xs">
            <option :selected="rental.status === 'not_returned'">
              <StatusBadge status="not_returned" />
            </option>
            <option :selected="rental.status === 'partially_returned'">
              <StatusBadge status="partially_returned" />
            </option>
            <option :selected="rental.status === 'returned'">
              <StatusBadge status="returned" />
            </option>
          </select>
          <StatusBadge v-else :status="rental.status" />
        </div>
      </div>
      <hr class="my-3" />
      <div
        class="grid grid-cols-[max-content_min-content_1fr] border rounded-sm">
        <b class="border px-1">Gear</b>
        <b class="border px-1">Amount</b>
        <b class="border px-1">Returned amount</b>
        <template
          v-for="({ name, rentedAmount }, idx) of rental.gear"
          :key="idx">
          <div class="border p-1">{{ name }}</div>
          <div class="border p-1">{{ rentedAmount }}</div>
          <div class="border p-1">
            <span v-if="editMode">
              <InputNumber
                v-model="rentalUpdate!.gear[idx].returnedAmount"
                :clamp-input="true"
                :hard-min="0"
                :hard-max="rentedAmount" />
            </span>
            <span v-else>{{ rentalUpdate!.gear[idx].returnedAmount }}</span>
          </div>
        </template>
      </div>
      <hr class="my-3" />
      <div class="flex justify-end">
        <button
          v-if="editMode"
          class="btn btn-primary"
          @click="editMode = false">
          Save changes
        </button>
        <button v-else class="btn btn-primary" @click="markReturned()">
          Mark as returned
        </button>
      </div>
    </div>
  </FullPageCard>
</template>
