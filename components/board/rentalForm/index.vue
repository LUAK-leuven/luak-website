<script setup lang="ts">
  import * as yup from 'yup';
  import type { RentalItem } from '~/types/board/form/RentalItem';
  import type { EntityId } from '~/types/common';
  import type { Enums } from '~/types/database.types';
  import type { GearItemId, TopoId } from '~/types/gear';
  import type { UnsavedRental } from '~/types/renal';
  import type { UserId } from '~/types/user';

  const popup = usePopup();

  const props = defineProps<{
    boardMemberName: string;
    allGear: RentalItem<GearItemId>[];
    allTopos: RentalItem<TopoId>[];
    initialValues: Partial<{
      memberId: UserId | 'non-user';
      contactInfo: {
        fullName: string;
        email?: string;
        phone?: string;
      };
      dateBorrow: string;
      dateReturn: string;
      gear: { id: GearItemId; amount: number }[];
      topos: { id: TopoId; amount: number }[];
      depositFee: number;
      paymentMethod: Enums<'payment_method'>;
      markAsReserved: boolean;
      comments: string;
    }>;
    handleSubmit: (
      rentalState: Omit<UnsavedRental, 'boardMemberId'>,
    ) => Promise<{ error: string | undefined }>;
  }>();

  const { data } = await gearService().getCompositeGearItems();
  const compositeGearItems = computed(() =>
    Object.fromEntries(
      data.value?.map((it) => [
        it.name,
        it.gearItemIds.map((it) => ({ itemId: it.id, amount: it.amount })),
      ]) ?? [],
    ),
  );

  const selectionFrom = <T extends EntityId<unknown>>(
    selection: { id: T; name: string; totalAmount: number }[],
  ) =>
    yup
      .array()
      .of(
        yup.object({
          id: yup.string<T>().required(),
          amount: yup
            .number()
            .required()
            .test(function (amount) {
              const { id } = this.parent as { id: string };
              const item = selection.find((x) => x.id === id);
              if (item === undefined) {
                console.warn(
                  `Could not find item ${id} in ${selection.map((x) => x.id).toString()}!`,
                );
                return this.createError({
                  path: `${this.path}`,
                  message: `Error: item with id ${id} cannot be found in the inventory.`,
                });
              }
              if (amount <= 0) {
                return this.createError({
                  path: `${this.path}`,
                  message: `Value for ${item.name} must be a positive number.`,
                });
              }
              if (amount > item.totalAmount) {
                return this.createError({
                  path: `${this.path}`,
                  message: `Value for ${item.name} cannot exceed ${item.totalAmount}`,
                });
              }
              return true;
            }),
        }),
      )
      .default([])
      .required();

  const formSchema = yup.object({
    memberId: yup.string<UserId | 'non-user'>().when('contactInfo', {
      is: (x: unknown) => {
        return x === undefined;
      },
      then: (s) => s.required(),
    }),
    dateBorrow: yup.string().required().label('date borrow'),
    dateReturn: yup
      .string()
      .required()
      .test(
        'isAfter',
        'Return date must be after borrow date',
        (date, context) => {
          return context.parent.dateBorrow < date;
        },
      )
      .label('return date'),
    gear: selectionFrom(props.allGear),
    topos: selectionFrom(props.allTopos),
    depositFee: yup.number().required().min(0),
    paymentMethod: yup.string<'transfer' | 'cash'>().required(),
    contactInfo: yup
      .object({
        fullName: yup.string().required(),
        email: yup.string().email(),
        phone: yup_phone,
      })
      .optional()
      .default(undefined)
      .test('email and phone', function (contact) {
        if (contact && !contact.email && !contact.phone) {
          return this.createError({
            path: `${this.path}`,
            message: `One of email or phone number is required`,
          });
        }
        return true;
      }),
    markAsReserved: yup.bool().default(false),
    comments: yup.string(),
  });

  const { meta, handleSubmit, errors, validateField, values, defineField } =
    useForm({
      validationSchema: toTypedSchema(formSchema),
      initialValues: props.initialValues,
      validateOnMount: false,
    });

  const errorAttr = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    props: (state: any) => ({ error: state.errors[0] }),
  };

  const [selectedUser] = defineField('memberId');
  const [selectedGear] = defineField('gear');
  const [selectedTopos] = defineField('topos');
  const [dateBorrow, dateBorrowAttr] = defineField('dateBorrow', errorAttr);
  const [dateReturn, dateReturnAttr] = defineField('dateReturn', errorAttr);
  const [depositFee, depositFeeAttr] = defineField('depositFee', errorAttr);

  const onSubmit = handleSubmit(async (formState) => {
    const { error } = await props.handleSubmit({
      memberId:
        formState.memberId === 'non-user' ? undefined : formState.memberId,
      dateBorrow: formState.dateBorrow,
      dateReturn: formState.dateReturn,
      gear: Object.fromEntries(
        formState.gear.map(({ id, amount }) => [id, amount]),
      ),
      topos: Object.fromEntries(
        formState.topos.map(({ id, amount }) => [id, amount]),
      ),
      depositFee: formState.depositFee,
      paymentMethod: formState.paymentMethod,
      contactInfo: formState.contactInfo,
      status: formState.markAsReserved ? 'reserved' : 'not_returned',
      comments: formState.comments,
    });
    if (error !== undefined)
      popup.value = {
        type: 'error',
        message: error,
      };
  });

  const computedGearDeposit = ref<number>();
  const computedTopoDeposit = ref<number>();
  const computedDeposit = computed(() => {
    const total =
      ((computedGearDeposit.value ?? 0) + (computedTopoDeposit.value ?? 0)) /
      100;
    return total > 20 ? total : 20;
  });

  onMounted(() => {
    validateField('paymentMethod');
  });
</script>

<template>
  <form @submit.prevent="onSubmit">
    <h2>General info</h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-2 mb-3">
      <div class="w-full self-end">
        <BoardRentalFormSelectMember
          v-model="selectedUser"
          :disable="props.initialValues.memberId !== undefined" />
      </div>

      <InputText2
        class="w-full"
        label="Board member *"
        :model-value="boardMemberName"
        :disabled="true" />

      <InputText2
        v-model="dateBorrow"
        label="Date borrow *"
        type="date"
        v-bind="dateBorrowAttr" />
      <InputText2
        v-model="dateReturn"
        label="Date return *"
        type="date"
        v-bind="dateReturnAttr" />

      <div class="flex flex-col w-fit">
        <label class="my-2" for="markAsReserved">Mark as reserved</label>
        <Field
          id="markAsReserved"
          class="toggle toggle-primary"
          name="markAsReserved"
          :value="true"
          type="checkbox" />
      </div>

      <div class="flex flex-col w-full col-span-full">
        <span>Comments:</span>
        <Field v-slot="{ field }" name="comments">
          <textarea class="textarea textarea-bordered" v-bind="field" />
        </Field>
      </div>
    </div>

    <hr />
    <h2>Gear list</h2>
    <BoardRentalFormItemSelection
      v-model="selectedGear"
      placeholder="Search gear to add ..."
      :all-items="allGear"
      :composite-items="compositeGearItems"
      @computed-deposit="(value) => (computedGearDeposit = value)" />
    <div class="h-4"></div>
    <BoardRentalFormItemSelection
      v-model="selectedTopos"
      :all-items="allTopos"
      placeholder="Search topos ..."
      @computed-deposit="(value) => (computedTopoDeposit = value)" />

    <hr class="mt-4" />

    <h2>Payment</h2>
    <div class="flex flex-row items-end gap-5">
      <InputText2
        v-model="depositFee"
        label="Deposit fee *"
        type="number"
        :placeholder="computedDeposit?.toString()"
        :auto-fill-with-placeholder="true"
        v-bind="depositFeeAttr">
        <template #label1><span class="mr-1">€</span></template>
      </InputText2>
      <Field
        class="select select-bordered w-min"
        :class="errors.paymentMethod ? 'select-error border-4' : ''"
        name="paymentMethod"
        as="select">
        <option disabled selected>Payment method</option>
        <option value="cash">cash</option>
        <option value="transfer">transfer</option>
      </Field>
    </div>

    <div class="flex justify-end">
      <button
        class="btn btn-primary mt-3 w-fit"
        :class="{ 'btn-disabled': !meta.valid || !meta.dirty }"
        type="submit">
        Submit
      </button>
    </div>
  </form>

  <!-- <p>SelectedGear: {{ selectedGear }}</p> -->
  <p>Values: {{ values }}</p>
  <p>Errors: {{ errors }}</p>
  <p>Meta: {{ meta }}</p>
</template>
