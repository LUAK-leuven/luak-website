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
    boardMember: yup.string().required(),
    member: yup.string().required(),
    date_borrow: yup.string().required().label('date borrow'),
    date_return: yup
      .string()
      .required()
      .test(
        'isAfter',
        'Return date must be after borrow date',
        (date, context) => {
          return context.parent.date_borrow < date;
        },
      )
      .label('return date'),
    gear: yup
      .array(yup.mixed<{ id: string; amount: number }>().required())
      .required()
      .min(1),
    deposit_fee: yup.number().required().positive(),
  });
  const initialValues = {
    boardMember: boardMember.name,
    date_borrow: dayjs().format('YYYY-MM-DD').toString(),
    date_return: dayjs().add(3, 'w').format('YYYY-MM-DD').toString(),
  };

  const { meta, handleSubmit } = useForm({
    validationSchema: toTypedSchema(formSchema),
    initialValues: initialValues,
  });

  const submitError = ref(false);
  const errorMessage = ref<string>();

  const onSubmit = handleSubmit(async (formState) => {
    formState.boardMember = boardMember.id;
    console.log(formState);
    // TODO: Show preview
    const { error } = await gearService().saveRental(formState);
    submitError.value = !!error;
    errorMessage.value = error;
    if (!error) navigateTo('/');
  });

  const computedDeposit = ref<number>();
</script>

<template>
  <FullPageCard>
    <template #title>Rental form 🧗</template>

    <form @submit.prevent="onSubmit">
      <h2>General info</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-2 mb-3">
        <div class="w-full self-end">
          <BoardRentalSelectMember />
          <!-- <div
            v-if="!(values.member?.hasPaid ?? true)"
            class="bg-yellow-300 rounded-md w-fit px-1">
            Warning: user has no active membership!
          </div> -->
        </div>

        <InputText
          class="w-full"
          label="Board member *"
          name="boardMember"
          :disabled="true" />

        <InputText label="Date borrow *" name="date_borrow" type="date" />
        <InputText label="Date return *" name="date_return" type="date" />
      </div>

      <hr />
      <h2>Gear list</h2>
      <BoardRentalGearSelection
        @computed-deposit-fee="
          (value) => (computedDeposit = value < 2000 ? 20 : value / 100)
        " />
      <hr />

      <h2>Payment</h2>
      <InputText
        label="Deposit fee *"
        name="deposit_fee"
        type="number"
        :placeholder="computedDeposit?.toString() ?? 'deposit'"
        :auto-fill-with-placeholder="true">
        <template #label1><span class="mr-1">€</span></template>
      </InputText>

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
