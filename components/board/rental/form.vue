<script setup lang="ts">
  import * as yup from 'yup';
  import type { Enums } from '~/types/database.types';

  const popup = usePopup();

  const props = defineProps<{
    boardMember: { id: string; name: string };
    allGear: PublicGearInfo[];
    allTopos: PublicGearInfo[];
    initialValues: Partial<{
      memberId: string;
      dateBorrow: string;
      dateReturn: string;
      gear: { id: string; amount: number }[];
      topos: { id: string; amount: number }[];
      depositFee: number;
      paymentMethod: Enums<'payment_method'>;
      markAsReserved: boolean;
      comments: string;
    }>;
    handleSubmit: (
      rentalState: UnsavedRental,
    ) => Promise<{ error: string | undefined }>;
  }>();

  const gearMap = Object.fromEntries(
    props.allGear.map((gearItem) => [gearItem.id, gearItem]),
  );
  const topoMap = Object.fromEntries(
    props.allTopos.map((topo) => [topo.id, topo]),
  );

  const selectionFrom = (
    selection: Record<string, { name: string; totalAmount: number }>,
  ) =>
    yup
      .array()
      .of(
        yup.object({
          id: yup.string().required(),
          amount: yup
            .number()
            .required()
            .test(function (amount) {
              const { id } = this.parent as { id: string };
              if (amount <= 0) {
                return this.createError({
                  path: `${this.path}`,
                  message: `Value for ${selection[id].name} must be a positive number`,
                });
              }
              if (amount > selection[id].totalAmount) {
                return this.createError({
                  path: `${this.path}`,
                  message: `Value for ${selection[id].name} cannot exceed ${selection[id].totalAmount}`,
                });
              }
              return true;
            }),
        }),
      )
      .default([])
      .required();

  const formSchema = yup
    .object({
      memberId: yup.string().when('contactInfo', {
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
      gear: selectionFrom(gearMap),
      topos: selectionFrom(topoMap),
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
    })
    .test('require gear', function (value) {
      if (
        Object.keys(value.gear).length + Object.keys(value.topos).length ==
        0
      ) {
        return this.createError({
          path: `${this.path}topos`,
          message: `You must select gear for the rental`,
        });
      }
      return true;
    });

  const { meta, handleSubmit, errors, validateField, values } = useForm({
    validationSchema: toTypedSchema(formSchema),
    initialValues: {
      boardMemberId: props.boardMember.name,
      ...props.initialValues,
    },
    validateOnMount: false,
  });

  const onSubmit = handleSubmit(async (formState) => {
    console.log(formState);
    const { error } = await props.handleSubmit({
      memberId: formState.memberId === '' ? undefined : formState.memberId,
      boardMemberId: props.boardMember.id,
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
          name="memberId"
          :disable="props.initialValues.memberId !== undefined" />
      </div>

      <InputText
        class="w-full"
        label="Board member *"
        name="boardMemberId"
        :disabled="true" />

      <InputText label="Date borrow *" name="dateBorrow" type="date" />
      <InputText label="Date return *" name="dateReturn" type="date" />

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
    <BoardRentalFormGearSelection
      :all-gear="allGear"
      :gear-map="gearMap"
      field-name="gear"
      placeholder="select gear"
      @computed-deposit-fee="(value) => (computedGearDeposit = value)" />
    <div class="h-4"></div>
    <BoardRentalFormGearSelection
      :all-gear="allTopos"
      :gear-map="topoMap"
      field-name="topos"
      placeholder="select topos"
      @computed-deposit-fee="(value) => (computedTopoDeposit = value)" />

    <hr class="mt-4" />

    <h2>Payment</h2>
    <div class="flex flex-row items-end gap-5">
      <InputText
        label="Deposit fee *"
        name="depositFee"
        type="number"
        :placeholder="computedDeposit?.toString()"
        :auto-fill-with-placeholder="true">
        <template #label1><span class="mr-1">€</span></template>
      </InputText>
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

  <!-- <p>Values: {{ values }}</p>
  <p>Errors: {{ errors }}</p> -->
</template>
