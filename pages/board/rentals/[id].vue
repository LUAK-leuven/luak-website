<script setup lang="ts">
  // import ReturnDate from '~/components/board/rental/returnDate.vue';
  // import StatusBadge from '~/components/board/rental/statusBadge.vue';
  import type { Enums } from '~/types/database.types';
  import type { RentalDetails } from '~/utils/gearService';

  const rental = ref<RentalDetails>();
  const loading = ref(true);
  const rentalUpdate = ref<{
    dateReturn: string;
    depositFee: number;
    gear: {
      returnedAmount: number;
    }[];
    status: Enums<'rental_status'>;
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
        status: rental.value.status,
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
      rentalUpdate.value!.status = 'returned';
    }
  }

  async function save() {
    editMode.value = false;
    if (rental.value === undefined || rentalUpdate.value === undefined) return;
    const gear: { id: string; actualAmount: number }[] = new Array(
      rental.value.gear.length,
    );
    for (let i = 0; i < rental.value.gear.length; i++) {
      gear[i] = {
        id: rental.value.gear[i].id,
        actualAmount:
          rental.value.gear[i].rentedAmount -
          rentalUpdate.value.gear[i].returnedAmount,
      };
    }
    // TODO: feedbackk on success/fail
    await gearService().updateRental({
      id: rental.value.id,
      dateReturn: rentalUpdate.value.dateReturn,
      depositFee: rentalUpdate.value.depositFee,
      gear: gear,
      status: rentalUpdate.value.status,
    });
    // TODO: input validation
  }
</script>

<template>
  <FullPageCard>
    <template #subtitle
      ><h2>Rental</h2>
      <i class="text-sm">{{ rental ? rental.id : '' }}</i></template
    >
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
            <BoardRentalReturnDate v-else :date="rentalUpdate!.dateReturn" />
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
            <option :selected="rentalUpdate!.status === 'not_returned'">
              <BoardRentalStatusBadge status="not_returned" />
            </option>
            <option :selected="rentalUpdate!.status === 'partially_returned'">
              <BoardRentalStatusBadge status="partially_returned" />
            </option>
            <option :selected="rentalUpdate!.status === 'returned'">
              <BoardRentalStatusBadge status="returned" />
            </option>
          </select>
          <BoardRentalStatusBadge v-else :status="rental.status" />
        </div>
      </div>
      <hr class="my-3" />
      <div
        class="grid grid-cols-[max-content_min-content_1fr] border rounded-sm">
        <b class="border px-1">Gear</b>
        <b class="border px-1">Amount</b>
        <b class="border px-1">Returned amount</b>
        <template
          v-for="({ name, rentedAmount, actualAmount }, idx) of rental.gear"
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
            <span v-else>{{ rentedAmount - actualAmount }}</span>
          </div>
        </template>
      </div>
      <hr class="my-3" />
      <div class="flex justify-end">
        <button v-if="editMode" class="btn btn-primary" @click="save()">
          Save changes
        </button>
        <button v-else class="btn btn-primary" @click="markReturned()">
          {{ rental.status === 'not_returned' ? 'Mark as returned' : 'Edit' }}
        </button>
      </div>
    </div>
  </FullPageCard>
</template>
