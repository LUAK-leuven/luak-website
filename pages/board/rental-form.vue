<script setup lang="ts">
  import * as yup from 'yup';
  import dayjs from 'dayjs';

  definePageMeta({ middleware: 'board-member-guard' });

  const user = await useLuakMember();
  const boardMember = {
    name: user.userInfo!.first_name + ' ' + user.userInfo!.last_name,
    id: user.userInfo!.id,
  };

  const allGear = await gearService().getPublicGearInfo();
  const gearMap = Object.fromEntries(
    allGear.map((gearItem) => [gearItem.id, gearItem]),
  );

  const formSchema = yup.object({
    boardMemberId: yup.string().required(),
    memberId: yup.string().uuid().required(),
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
    gear: yup
      .array(
        yup
          .object({
            gearItemId: yup.string().required().uuid(),
            amount: yup.number().required().integer().moreThan(0),
          })
          .required()
          .test('max_amount', function (gearItem) {
            if (gearItem.amount > gearMap[gearItem.gearItemId].totalAmount) {
              return this.createError({
                path: `${this.path}.amount`,
                message: `Value for ${gearMap[gearItem.gearItemId].name} cannot exceed ${gearMap[gearItem.gearItemId].totalAmount}`,
              });
            }

            return true;
          }),
      )
      .required()
      .min(1),
    depositFee: yup.number().required().min(0),
    paymentMethod: yup.string<'transfer' | 'cash'>().required(),
  });

  const initialValues = {
    boardMemberId: boardMember.name,
    dateBorrow: dayjs().format('YYYY-MM-DD').toString(),
    dateReturn: dayjs().add(3, 'w').format('YYYY-MM-DD').toString(),
  } as const;

  const { values, meta, handleSubmit, errors, validateField } = useForm({
    validationSchema: toTypedSchema(formSchema),
    initialValues: initialValues,
    validateOnMount: false,
  });

  const submitError = ref(false);
  const errorMessage = ref<string>();

  const onSubmit = handleSubmit(async (formState) => {
    formState.boardMemberId = boardMember.id;
    console.log(formState);
    // TODO: Show preview
    const { id, error } = await gearService().saveRental(formState);
    console.log('id', id);
    submitError.value = !!error;
    errorMessage.value = error;
    if (!error) {
      if (id) navigateTo(`/board/rentals/${id}`);
      else navigateTo('/');
    }
  });

  const computedDeposit = ref<number>();

  onMounted(() => {
    validateField('paymentMethod');
  });
</script>

<template>
  <FullPageCard>
    <template #title>Rental form 🧗</template>

    <form @submit.prevent="onSubmit">
      <h2>General info</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-2 mb-3">
        <div class="w-full self-end">
          <BoardRentalFormSelectMember name="memberId" />
        </div>

        <InputText
          class="w-full"
          label="Board member *"
          name="boardMemberId"
          :disabled="true" />

        <InputText label="Date borrow *" name="dateBorrow" type="date" />
        <InputText label="Date return *" name="dateReturn" type="date" />
      </div>

      <hr />
      <h2>Gear list</h2>
      <BoardRentalFormGearSelection
        :all-gear="allGear"
        :gear-map="gearMap"
        @computed-deposit-fee="
          (value) => (computedDeposit = value < 2000 ? 20 : value / 100)
        " />
      <hr />

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

    <p>Values: {{ values }}</p>
    <p>Errors: {{ errors }}</p>

    <pop-up v-model:show="submitError" type="error">{{ errorMessage }}</pop-up>
  </FullPageCard>
</template>
