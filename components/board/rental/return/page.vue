<script setup lang="ts">
  import * as yup from 'yup';
  import type { Enums } from '~/types/database.types';
  import type { GearItemId, TopoId } from '~/types/gear';
  import { computeRentalStatusUnsafe } from '~/utils/rental/computeStatus';
  import TextField from '~/components/input/TextField.vue';
  import { useToast } from '~/composables/useToast';
  import type { RentalDetails, RentalUpdate } from '~/types/rental';
  import RentalItem from './rentalItem.vue';

  const props = defineProps<{
    rental: RentalDetails;
    update: (rental: RentalUpdate) => Promise<boolean>;
  }>();

  const { show: showPopup } = useToast();

  const formSchema = computed(() =>
    yup.object({
      dateReturn: yup
        .string()
        .required()
        .test('isAfter', 'Return date must be after borrow date', (date) => {
          return props.rental.dateBorrow < date;
        })
        .label('return date'),
      returnedGear: yup
        .array(yup.number().integer().required().min(0))
        .required()
        .test('max_per_item', function (array) {
          for (let i = 0; i < array.length; i++) {
            if (array[i]! > props.rental.gear[i]!.rentedAmount) {
              return this.createError({
                path: `${this.path}[${i.toFixed()}]`,
                message: `Value for ${props.rental.gear[i]!.name} cannot exceed rented amount`,
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
            if (array[i]! > props.rental.topos[i]!.rentedAmount) {
              return this.createError({
                path: `${this.path}[${i.toFixed()}]`,
                message: `Value for ${props.rental.topos[i]!.title} cannot exceed rented amount`,
              });
            }
          }
          return true;
        }),
      depositReturned: yup.bool().default(false),
      comments: yup.string(),
    }),
  );

  const { handleSubmit, values } = useForm({
    validationSchema: toTypedSchema(formSchema.value),
    initialValues: {
      dateReturn: props.rental.dateReturn,
      returnedGear: props.rental.gear.map(
        (gearItem) => gearItem.returnedAmount,
      ),
      returnedTopos: props.rental.topos.map((topo) => topo.returnedAmount),
      depositReturned: props.rental.depositReturned,
      comments: props.rental.comments,
    },
  });
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { update: updateReturnedGear, fields: returnedGear } =
    useFieldArray<number>('returnedGear');
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { update: updateReturnedTopos, fields: returnedTopos } =
    useFieldArray<number>('returnedTopos');

  const { bouncing, triggerBounce } = useBounce();

  const save = handleSubmit(
    async (formState) => {
      const gear: { gear_item_id: GearItemId; returned_amount: number }[] = [];
      for (let i = 0; i < props.rental.gear.length; i++) {
        if (
          formState.returnedGear[i] !== props.rental.gear[i]!.returnedAmount
        ) {
          gear.push({
            gear_item_id: props.rental.gear[i]!.id,
            returned_amount: formState.returnedGear[i]!,
          });
        }
      }
      const topos: { topo_id: TopoId; returned_amount: number }[] = [];
      for (let i = 0; i < props.rental.topos.length; i++) {
        if (
          formState.returnedTopos[i] !== props.rental.topos[i]!.returnedAmount
        ) {
          topos.push({
            topo_id: props.rental.topos[i]!.id,
            returned_amount: formState.returnedTopos[i]!,
          });
        }
      }
      const success = await props.update({
        id: props.rental.id,
        dateReturn: formState.dateReturn,
        depositReturned: formState.depositReturned,
        gear: gear,
        topos: topos,
        status: computedStatus.value,
        comments: formState.comments,
      });

      if (success) {
        showPopup('success', 'Your changes have been saved.');
        await exitReturn();
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
    return computeRentalStatusUnsafe(
      props.rental.gear.map((it) => it.rentedAmount),
      values.returnedGear!,
      props.rental.topos.map((it) => it.rentedAmount),
      values.returnedTopos!,
      values.depositReturned!,
    );
  });

  async function exitReturn() {
    await navigateTo({
      name: 'board-rentals-id',
      params: { id: props.rental.id },
    });
  }
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
          <TextField
            name="dateReturn"
            type="date"
            data-testId="editDateReturn" />
        </span>
      </div>
      <div class="flex flex-row gap-1 items-center">
        <span>Deposit:</span>
        <span data-testId="depositFee">{{ rental.depositFee.toFixed(2) }}</span>
        <Field
          class="checkbox checkbox-success border-2 ml-1"
          name="depositReturned"
          type="checkbox"
          :value="true"
          data-testId="depositReturned" />
      </div>
      <div data-testId="paymentMethod">Payment: {{ rental.paymentMethod }}</div>
      <div class="flex flex-row gap-1 items-center">
        <span>Status:</span>
        <BoardRentalStatusBadge :status="computedStatus" data-testId="status" />
      </div>
      <div class="col-span-full flex flex-col">
        <span>Comments:</span>
        <Field v-slot="{ field }" name="comments">
          <textarea
            class="textarea textarea-bordered"
            data-testId="editComments"
            v-bind="field" />
        </Field>
      </div>
    </div>
    <hr class="my-3" />
    <div
      class="border rounded-sm grid"
      :class="'grid-cols-[3fr_auto_1fr_auto]'"
      data-testId="gear-and-topos-overview">
      <b class="border px-1">Gear</b>
      <b class="border px-1"></b>
      <b class="border px-1">Amount</b>
      <b class="border px-1" />
      <RentalItem
        v-for="({ title, rentedAmount }, idx) of rental.topos"
        :key="idx"
        :bouncing="bouncing[`returnedTopos[${idx}]`]"
        :name="title"
        :rented-amount="rentedAmount"
        :returned-amount="returnedTopos[idx]!.value"
        @update-returned-amount="
          (amount) => updateReturnedTopos(idx, amount)
        " />
      <RentalItem
        v-for="({ name, rentedAmount }, idx) of rental.gear"
        :key="idx"
        :bouncing="bouncing[`returnedGear[${idx}]`]"
        :name="name"
        :rented-amount="rentedAmount"
        :returned-amount="returnedGear[idx]!.value"
        @update-returned-amount="(amount) => updateReturnedGear(idx, amount)" />
    </div>
    <hr class="my-3" />
    <div class="flex justify-end gap-3">
      <button class="btn btn-error btn-outline" @click="exitReturn">
        Cancel
      </button>
      <SharedLoadingButton
        text="Save changes"
        :click-handler="save"
        data-testId="saveButton" />
    </div>
  </form>
</template>
