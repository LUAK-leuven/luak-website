<script setup lang="ts">
  import {
    number as yupNumber,
    object as yupObject,
    string as yupString,
  } from 'yup';

  import type {
    GearInventoryDetails,
    GearInventoryId,
  } from '#shared/api/rest/gear';
  import type { RentalId } from '#shared/api/rest/rental.ts';
  import GearInventorySelection from '~/components/board/lost-gear/GearInventorySelection.vue';
  import Number from '~/components/input/NumberCompact.vue';
  import WithLazyResource from '~/components/pages/WithLazyResource.vue';
  import LoadingButton from '~/components/shared/LoadingButton.vue';
  import type { RentalItem } from '~/model/Rental.js';

  const props = defineProps<{
    rentalId: RentalId;
    gearItem: RentalItem;
  }>();

  const { show } = useToast();
  const gearService = useGearService();

  const { data, pending, error } = await useLazyFetch<GearInventoryDetails>(
    `/api/gear/inventory/${props.gearItem.id}`,
    {
      method: 'get',
    },
  );

  const formSchema = yupObject({
    lostAmount: yupNumber()
      .required()
      .min(1)
      .max(props.gearItem.unreturnedAmount),
    inventoryItem: yupString<GearInventoryId>()
      .uuid()
      .required('You must select an inventory item'),
  }).test('max on inventory', ({ lostAmount, inventoryItem }, ctx) => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (data.value === undefined || inventoryItem === undefined) return true;
    const amountInventory = getBy(
      data.value.inventory,
      'id',
      inventoryItem,
    ).totalAmount;
    if (lostAmount > amountInventory)
      return ctx.createError({
        path: 'lostAmount',
        message: 'Lost amount cannot exceed available inventory amount',
      });
    return true;
  });

  const { defineField, errors, handleSubmit } = useForm({
    validationSchema: toTypedSchema(formSchema),
    initialValues: { lostAmount: 1 },
  });

  const onSubmit = async () =>
    handleSubmit(
      async (formState) => {
        const { error } = await gearService.markAsLost({
          rentalItemId: props.gearItem.id,
          rentalId: props.rentalId,
          inventoryItemId: formState.inventoryItem,
          lostAmount: formState.lostAmount,
        });
        if (error) {
          show('error', 'Server error: Failed to submit response.');
        } else {
          await navigateTo({
            name: 'board-rentals-id',
            params: { id: props.rentalId },
          });
        }
      },
      ({ errors }) => {
        show('error', errors.inventoryItem ?? errors.lostAmount ?? '');
      },
    )();

  const [lostAmount] = defineField('lostAmount');
  const [inventoryItem] = defineField('inventoryItem');
</script>
<template>
  <h2 class="text-center">Gear item</h2>

  <form @submit.prevent>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div data-testId="gear.name">Gear item: {{ gearItem.name }}</div>

      <div data-testId="rentedAmount">
        Rented amount: {{ gearItem.rentedAmount }}
      </div>
      <div data-testId="unreturnedAmount">
        Unreturned amount: {{ gearItem.unreturnedAmount }}
      </div>
      <div>
        <div class="col-span-full flex flex-row gap-2 items-center">
          Lost amount:
          <Number
            v-model="lostAmount"
            :text-box-color="errors.lostAmount ? 'input-error' : ''"
            data-testId="lostAmount" />
        </div>
        <ErrorMessage
          class="text-error"
          name="lostAmount"
          data-testId="lostAmount.error" />
      </div>
    </div>

    <hr class="my-2" />
    <h2 class="text-center">Select inventory item</h2>

    <WithLazyResource
      v-slot="{ data: { inventory } }"
      :data="data"
      :is-loading="pending"
      :error="error?.message">
      <GearInventorySelection
        v-model="inventoryItem"
        :inventory="inventory"
        :lost-amount="lostAmount" />
    </WithLazyResource>

    <div class="flex flex-row justify-end mt-3">
      <LoadingButton
        text="Save changes"
        :click-handler="onSubmit"
        data-testId="saveButton" />
    </div>
  </form>
</template>
