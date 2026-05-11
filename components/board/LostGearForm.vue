<script setup lang="ts">
  import TextField from '~/components/input/TextField.vue';
  import SubmitButton from '~/components/shared/SubmitButton.vue';
  import * as yup from 'yup';
  import type { RentalId } from '~/types/rental';
  import type { GearInventoryId, GearItemId } from '~/types/gear';

  const emit = defineEmits<{
    submit: [
      rentalId: RentalId,
      gearItemId: GearItemId,
      inventoryId: GearInventoryId,
      dateLost: string,
      lostAmount: number,
    ];
  }>();

  const formSchema = yup.object({
    rentalId: yup.string().uuid().required(),
    gearItemId: yup.string().uuid().required(),
    inventoryId: yup.string().uuid().required(),
    dateLost: yup.string().required(),
    lostAmount: yup.number().positive().required(),
  });

  const { handleSubmit, isSubmitting } = useForm({
    validationSchema: toTypedSchema(formSchema),
  });

  const onSubmit: () => Promise<void> = handleSubmit(
    (formState) => {
      console.log(formState);
      emit(
        'submit',
        formState.rentalId as RentalId,
        formState.gearItemId as GearItemId,
        formState.inventoryId as GearInventoryId,
        formState.dateLost,
        formState.lostAmount,
      );
    },
    (ctx) => {
      console.warn(ctx.errors);
    },
  );
</script>

<template>
  <form @submit.prevent="onSubmit">
    <TextField
      name="rentalId"
      label="Rental id:"
      placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
      data-testId="rental-id" />
    <TextField
      name="gearItemId"
      label="Gear item id:"
      placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
      data-testId="gear-item-id" />
    <TextField
      name="inventoryId"
      label="Gear inventory id:"
      placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
      data-testId="inventory-id" />
    <TextField
      name="dateLost"
      label="Date lost:"
      type="date"
      data-testId="date-lost" />
    <TextField
      name="lostAmount"
      label="Amount of lost item:"
      type="number"
      placeholder=""
      data-testId="lost-amount" />
    <div class="mt-4 flex flex-row justify-end">
      <SubmitButton
        text="Submit"
        :is-loading="isSubmitting"
        data-testId="submit" />
    </div>
  </form>
</template>
