<script setup lang="ts">
  import * as yup from 'yup';
  import type { Enums } from '~/types/database.types';

  const { rental } = defineProps<{ rental: RentalDetails }>();

  const formSchema = computed(() =>
    yup.object({
      dateReturn: yup
        .string()
        .required()
        .test('isAfter', 'Return date must be after borrow date', (date) => {
          return rental.dateBorrow < date;
        })
        .label('return date'),
      returnedGear: yup
        .array(yup.number().integer().required().min(0))
        .required()
        .test('max_per_item', function (array) {
          for (let i = 0; i < array.length; i++) {
            if (array[i] > rental.gear[i].rentedAmount) {
              return this.createError({
                path: `${this.path}[${i}]`,
                message: `Value for ${rental.gear[i].name} cannot exceed rented amount`,
              });
            }
          }
          return true;
        }),
      returnedTopos: yup
        .array(yup.number().integer().required().min(0))
        .required()
        .test('max_per_item', function (array) {
          for (let i = 0; i < array.length; i++) {
            if (array[i] > rental.topos[i].rentedAmount) {
              return this.createError({
                path: `${this.path}[${i}]`,
                message: `Value for ${rental.topos[i].title} cannot exceed rented amount`,
              });
            }
          }
          return true;
        }),
      depositFee: yup
        .number()
        .integer()
        .required()
        .when('status', {
          is: 'returned',
          then: (deposit) =>
            deposit.equals(
              [0],
              "When a rental is marked as 'Returned', the deposit fee must be returned and set to 0",
            ),
          otherwise: (deposit) => deposit.min(0).max(rental.depositFee),
        }),
      status: yup.string<Enums<'rental_status'>>().required(),
    }),
  );

  const { setValues, handleSubmit } = useForm({
    validationSchema: toTypedSchema(formSchema.value),
  });

  function markReturned() {
    editMode.value = true;
    setValues({
      dateReturn: rental.dateReturn,
      status: rental.status === 'not_returned' ? 'returned' : rental.status,
      returnedGear: rental.gear.map((gearItem) =>
        rental.status === 'not_returned'
          ? gearItem.rentedAmount
          : gearItem.rentedAmount - gearItem.actualAmount,
      ),
      returnedTopos: rental.topos.map((topo) =>
        rental.status === 'not_returned'
          ? topo.rentedAmount
          : topo.rentedAmount - topo.actualAmount,
      ),
      depositFee: rental.depositFee,
    });
  }

  const { bouncing, triggerBounce } = useBounce();
  const showPopup = ref(false);

  const save = handleSubmit(
    async (formState) => {
      const gear: Record<string, number> = {};
      for (let i = 0; i < rental.gear.length; i++) {
        const updatedAmount =
          rental.gear[i].rentedAmount - formState.returnedGear[i];
        if (updatedAmount !== rental.gear[i].actualAmount) {
          gear[rental.gear[i].id] = updatedAmount;
        }
      }
      const topos: Record<string, number> = {};
      for (let i = 0; i < rental.topos.length; i++) {
        const updatedAmount =
          rental.topos[i].rentedAmount - formState.returnedTopos[i];
        if (updatedAmount !== rental.topos[i].actualAmount) {
          topos[rental.topos[i].rentedToposId] = updatedAmount;
        }
      }
      // TODO: feedback on success/fail
      const success = await gearService().updateRental({
        id: rental.id,
        dateReturn: formState.dateReturn,
        depositFee: formState.depositFee,
        gear: gear,
        topos: topos,
        status: formState.status,
      });

      if (success) reloadNuxtApp();
      else showPopup.value = true;
    },
    (result) => {
      for (const field in result.errors) {
        triggerBounce(field);
      }
    },
  );

  const editMode = ref(false);
</script>

<template>
  <form @submit.prevent>
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
          <InputText v-if="editMode" name="dateReturn" type="date" />
          <BoardRentalReturnDate v-else :date="rental.dateReturn" />
        </span>
      </div>
      <div class="flex flex-row gap-1 items-center">
        <span>Deposit:</span>
        <InputNumber
          v-if="editMode"
          :class="{ 'animate-bounceInput': bouncing.depositFee }"
          name="depositFee"
          :clamp-input="true"
          :hard-min="0"
          :soft-max="rental.depositFee" />
        <span v-else>{{ rental.depositFee }}</span>
      </div>
      <div>Payment: {{ rental.paymentMethod }}</div>
      <div class="flex flex-row gap-1 items-center">
        <span>Status:</span>
        <InputSelect
          v-if="editMode"
          name="status"
          :options="
            [
              { value: 'not_returned', label: 'Not returned' },
              { value: 'partially_returned', label: 'Partially returned' },
              { value: 'returned', label: 'Returned' },
            ] as const
          "
          default-option="not_returned"
          disabled-option="Select the status" />
        <BoardRentalStatusBadge v-else :status="rental.status" />
      </div>
    </div>
    <hr class="my-3" />
    <div class="grid grid-cols-[max-content_min-content_1fr] border rounded-sm">
      <b class="border px-1">Gear</b>
      <b class="border px-1">Amount</b>
      <b class="border px-1">Returned amount</b>
      <template
        v-for="({ title, rentedAmount, actualAmount }, idx) of rental.topos"
        :key="idx">
        <div class="border p-1">{{ title }}</div>
        <div class="border p-1">{{ rentedAmount }}</div>
        <div class="border p-1">
          <span v-if="editMode">
            <InputNumber
              :class="{
                'animate-bounceInput': bouncing[`returnedTopos[${idx}]`],
              }"
              :name="`returnedTopos[${idx}]`" />
          </span>
          <span v-else>{{ rentedAmount - actualAmount }}</span>
        </div>
      </template>
      <template
        v-for="({ name, rentedAmount, actualAmount }, idx) of rental.gear"
        :key="idx">
        <div class="border p-1">{{ name }}</div>
        <div class="border p-1">{{ rentedAmount }}</div>
        <div class="border p-1">
          <span v-if="editMode">
            <InputNumber
              :class="{
                'animate-bounceInput': bouncing[`returnedGear[${idx}]`],
              }"
              :name="`returnedGear[${idx}]`" />
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
    <!-- <p>Values: {{ values }}</p>
    <p>Errors: {{ errors }}</p>
    <hr />
    <p>Rental: {{ rental }}</p> -->
  </form>

  <PopUp v-model:show="showPopup" type="error"> Failed to save changes </PopUp>
</template>
