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
      depositReturned: yup.bool().default(false),
      comments: yup.string(),
      statusReserved: yup.bool().default(false),
    }),
  );

  const { setValues, handleSubmit, values, errors } = useForm({
    validationSchema: toTypedSchema(formSchema.value),
  });

  function markReturned() {
    editMode.value = true;
    setValues({
      dateReturn: rental.dateReturn,
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
      depositReturned: rental.status === 'returned',
      comments: rental.comments,
      statusReserved: rental.status === 'reserved',
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
        status: computedStatus.value,
        comments: formState.comments,
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

  const computedStatus: ComputedRef<Enums<'rental_status'>> = computed(() => {
    if (editMode.value) {
      if (values.statusReserved) return 'reserved';
      let isAllReturned = true;
      let isAnyReturned = false;
      for (let i = 0; i < rental.gear.length; i++) {
        if (values.returnedGear![i] > 0) isAnyReturned = true;
        if (values.returnedGear![i] !== rental.gear[i].rentedAmount)
          isAllReturned = false;
      }
      for (let i = 0; i < rental.topos.length; i++) {
        if (values.returnedTopos![i] > 0) isAnyReturned = true;
        if (values.returnedTopos![i] !== rental.topos[i].rentedAmount)
          isAllReturned = false;
      }
      if (isAllReturned && values.depositReturned) return 'returned';
      else if (isAnyReturned) return 'partially_returned';
      else return 'not_returned';
    }
    return rental.status;
  });

  const editMode = ref(false);
</script>

<template>
  <form @submit.prevent>
    <div class="grid grid-cols-2 gap-3">
      <div v-if="rental.member" class="flex flex-col">
        <span>Member: {{ rental.member.fullName }}</span>
        <span v-if="rental.member.email" class="ml-3">
          ✉️: <MailTo :email="rental.member.email" />
        </span>
        <span v-if="rental.member.phoneNumber" class="ml-3">
          ☎️: <WhatsappLink :phone-number="rental.member.phoneNumber" />
        </span>
      </div>
      <div v-if="rental.boardMember">
        Board member: {{ rental.boardMember }}
      </div>
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
        <span>{{ rental.depositFee }}</span>
        <Field
          v-if="editMode"
          class="checkbox checkbox-success border-2 ml-1"
          name="depositReturned"
          type="checkbox"
          :value="true" />
      </div>
      <div>Payment: {{ rental.paymentMethod }}</div>
      <div class="flex flex-row gap-1 items-center">
        <span>Status:</span>
        <BoardRentalStatusBadge :status="computedStatus" />
        <Field
          v-if="editMode"
          class="toggle toggle-primary"
          name="statusReserved"
          type="checkbox"
          :value="true" />
      </div>
      <div
        v-if="editMode || rental.comments"
        class="col-span-full flex flex-col">
        <span>Comments:</span>
        <Field v-if="editMode" v-slot="{ field }" name="comments">
          <textarea class="textarea textarea-bordered" v-bind="field" />
        </Field>

        <p v-else class="italic">{{ rental.comments }}</p>
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
    <p>Values: {{ values }}</p>
    <p>Errors: {{ errors }}</p>
    <hr />
    <p>Rental: {{ rental }}</p>
  </form>

  <PopUp v-model:show="showPopup" type="error"> Failed to save changes </PopUp>
</template>
