<script setup lang="ts">
  import * as yup from 'yup';
  import type { Enums } from '~/types/database.types';
  import type { GearItemId, TopoId } from '~/types/gear';
  import { computeRentalStatusUnsafe } from '~/utils/rental/computeStatus';
  import TextField from '~/components/input/TextField.vue';

  const { rental } = defineProps<{ rental: RentalDetails }>();
  const { show: showPopup } = usePopup();

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
      depositReturned: yup.bool().default(false),
      comments: yup.string(),
      statusReserved: yup.bool().default(false),
    }),
  );

  const { setValues, handleSubmit, values, errors } = useForm({
    validationSchema: toTypedSchema(formSchema.value),
  });
  const { update: updateReturnedGear, fields: returnedGear } =
    useFieldArray<number>('returnedGear');
  const { update: updateReturnedTopos, fields: returnedTopos } =
    useFieldArray<number>('returnedTopos');

  function edit() {
    editMode.value = true;
    setValues({
      dateReturn: rental.dateReturn,
      returnedGear: rental.gear.map((gearItem) => gearItem.returnedAmount),
      returnedTopos: rental.topos.map((topo) => topo.returnedAmount),
      depositReturned: rental.depositReturned,
      comments: rental.comments,
      statusReserved: rental.status === 'reserved',
    });
  }

  const { bouncing, triggerBounce } = useBounce();

  const save = handleSubmit(
    async (formState) => {
      const gear: { gear_item_id: GearItemId; returned_amount: number }[] = [];
      for (let i = 0; i < rental.gear.length; i++) {
        if (formState.returnedGear[i] !== rental.gear[i].returnedAmount) {
          gear.push({
            gear_item_id: rental.gear[i].gearItemId,
            returned_amount: formState.returnedGear[i],
          });
        }
      }
      const topos: { topo_id: TopoId; returned_amount: number }[] = [];
      for (let i = 0; i < rental.topos.length; i++) {
        if (formState.returnedTopos[i] !== rental.topos[i].returnedAmount) {
          topos.push({
            topo_id: rental.topos[i].topoId,
            returned_amount: formState.returnedTopos[i],
          });
        }
      }
      const success = await gearService().updateRental({
        id: rental.id,
        dateReturn: formState.dateReturn,
        depositReturned: formState.depositReturned,
        gear: gear,
        topos: topos,
        status: computedStatus.value,
        comments: formState.comments,
      });

      if (success) {
        reloadNuxtApp();
        showPopup('success', 'Your changes have been saved.');
      } else {
        showPopup('error', 'Failed to save changes');
      }
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
      return computeRentalStatusUnsafe(
        rental.gear.map((it) => it.rentedAmount),
        values.returnedGear!,
        rental.topos.map((it) => it.rentedAmount),
        values.returnedTopos!,
        values.depositReturned!,
      );
    }
    return rental.status;
  });

  const editMode = ref(false);
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
          <TextField v-if="editMode" name="dateReturn" type="date" />
          <BoardRentalReturnDate
            v-else
            :date="rental.dateReturn"
            :ghost="rental.status === 'returned'"
            data-testId="dateReturn" />
        </span>
      </div>
      <div class="flex flex-row gap-1 items-center">
        <span>Deposit:</span>
        <span data-testId="depositFee">{{ rental.depositFee }}</span>
        <span
          v-if="!editMode && rental.depositReturned"
          class="badge badge-success">
          returned
        </span>
        <Field
          v-if="editMode"
          class="checkbox checkbox-success border-2 ml-1"
          name="depositReturned"
          type="checkbox"
          :value="true" />
      </div>
      <div data-testId="paymentMethod">Payment: {{ rental.paymentMethod }}</div>
      <div class="flex flex-row gap-1 items-center">
        <span>Status:</span>
        <BoardRentalStatusBadge :status="computedStatus" data-testId="status" />
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

        <p v-else class="italic" data-testId="comments">{{ rental.comments }}</p>
      </div>
    </div>
    <hr class="my-3" />
    <div class="grid grid-cols-[3fr_1fr_1fr] border rounded-sm">
      <b class="border px-1">Gear</b>
      <b class="border px-1">Amount</b>
      <b class="border px-1">Returned amount</b>
      <BoardRentalItem
        v-for="({ title, rentedAmount, returnedAmount }, idx) of rental.topos"
        :key="idx"
        :bouncing="bouncing[`returnedTopos[${idx}]`]"
        :name="title"
        :rented-amount="rentedAmount"
        :returned-amount="editMode ? returnedTopos[idx].value : returnedAmount"
        :edit-mode="editMode"
        :form-name="`returnedTopos[${idx}]`"
        @update-returned-amount="
          (amount) => updateReturnedTopos(idx, amount)
        " />
      <BoardRentalItem
        v-for="({ name, rentedAmount, returnedAmount }, idx) of rental.gear"
        :key="idx"
        :bouncing="bouncing[`returnedGear[${idx}]`]"
        :name="name"
        :rented-amount="rentedAmount"
        :returned-amount="editMode ? returnedGear[idx].value : returnedAmount"
        :edit-mode="editMode"
        :form-name="`returnedGear[${idx}]`"
        @update-returned-amount="(amount) => updateReturnedGear(idx, amount)" />
    </div>
    <hr class="my-3" />
    <div class="flex justify-end gap-3">
      <template v-if="editMode">
        <button class="btn btn-error btn-outline" @click="editMode = false">
          Cancel
        </button>
        <SharedLoadingButton text="Save changes" :click-handler="save" />
      </template>
      <template v-else>
        <button
          class="btn btn-secondary"
          @click="() => navigateTo(`/board/rentals/${rental.id}/edit`)">
          Edit
        </button>
        <button class="btn btn-primary" @click="edit()">Return</button>
      </template>
    </div>
    <!-- <p>Values: {{ values }}</p>
    <p>Errors: {{ errors }}</p>
    <hr />
    <p>Rental: {{ rental }}</p> -->
  </form>
</template>
