<script setup lang="ts">
  import * as yup from 'yup';
  import dayjs from 'dayjs';

  definePageMeta({ middleware: 'board-member-guard' });

  const user = await useLuakMember();
  const boardMember = {
    name: user.userInfo!.first_name + ' ' + user.userInfo!.last_name,
    id: user.userInfo!.id,
  };

  const formSchema = yup.object({
    boardMemberId: yup.string().required(),
    memberId: yup.string().required(),
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
      .array(yup.mixed<{ gearItemId: string; amount: number }>().required())
      .required()
      .min(1),
    depositFee: yup.number().required().positive(),
    paymentMethod: yup.string<'transfer' | 'cash'>().required(),
  });
  const initialValues = {
    boardMemberId: boardMember.name,
    dateBorrow: dayjs().format('YYYY-MM-DD').toString(),
    dateReturn: dayjs().add(3, 'w').format('YYYY-MM-DD').toString(),
  } as const;

  const { meta, handleSubmit, errors, validateField } = useForm({
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
    const { error } = await gearService().saveRental(formState);
    submitError.value = !!error;
    errorMessage.value = error;
    if (!error) navigateTo('/');
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
          <!-- <div
            v-if="!(values.member?.hasPaid ?? true)"
            class="bg-yellow-300 rounded-md w-fit px-1">
            Warning: user has no active membership!
          </div> -->
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
          :placeholder="computedDeposit?.toString() ?? 'deposit'"
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

    <pop-up v-model:show="submitError" type="error">{{ errorMessage }}</pop-up>
  </FullPageCard>
</template>
