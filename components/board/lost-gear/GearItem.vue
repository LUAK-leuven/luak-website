<script setup lang="ts">
  import WithLazyResource from '~/components/pages/WithLazyResource.vue';
  import LoadingButton from '~/components/shared/LoadingButton.vue';
  import Number from '~/components/input/Number.vue';
  import type { GearInventoryId } from '~/types/gear';
  import type { RentalDetails, RentalId } from '~/types/rental';
  import {
    object as yupObject,
    number as yupNumber,
    string as yupString,
  } from 'yup';
  import GearInventorySelection from './GearInventorySelection.vue';

  const props = defineProps<{
    rentalId: RentalId;
    gearItem: RentalDetails['gear'][number];
  }>();

  const { show } = useToast();

  const { data, pending, error } = await gearService().getGearItemDetails(
    props.gearItem.id,
  );

  const unReturnedAmount = computed(
    () => props.gearItem.rentedAmount - props.gearItem.returnedAmount,
  );

  const formSchema = yupObject({
    lostAmount: yupNumber().required().min(1).max(unReturnedAmount.value),
    inventoryItem: yupString<GearInventoryId>()
      .uuid()
      .required('You must select an inventory item'),
  }).test('max on inventory', ({ lostAmount, inventoryItem }, ctx) => {
    if (data.value === null || inventoryItem === undefined) return true;
    const amountInventory = getBy(
      data.value.inventory,
      'id',
      inventoryItem,
    ).amount;
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

  const onSubmit = handleSubmit(
    async (formState) => {
      console.log('submit', formState);
      const { error } = await useFetch('/api/gear/mark-as-lost', {
        method: 'post',
        body: {
          rentalId: props.rentalId,
          inventoryId: formState.inventoryItem,
          lostAmount: formState.lostAmount,
        },
      });
      if (error.value) {
        console.error(error.value.message);
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
  );

  const [lostAmount] = defineField('lostAmount');
  const [inventoryItem] = defineField('inventoryItem');
</script>
<template>
  <h2 class="text-center">Gear item</h2>

  <form @submit.prevent>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div data-testid="topo.title">Gear item: {{ gearItem.name }}</div>

      <div data-testid="rentedAmount">
        Rented amount: {{ gearItem.rentedAmount }}
      </div>
      <div data-testid="unreturnedAmount">
        Unreturned amount: {{ unReturnedAmount }}
      </div>
      <div>
        <div class="col-span-full flex flex-row gap-2 items-center">
          Lost amount:
          <Number
            v-model="lostAmount"
            :text-box-color="errors.lostAmount ? 'input-error' : ''"
            data-testid="lostAmount" />
        </div>
        <ErrorMessage
          class="text-error"
          name="lostAmount"
          data-testid="lostAmount.error" />
      </div>
    </div>

    <hr class="my-2" />
    <h2 class="text-center">Select inventory item</h2>

    <WithLazyResource
      v-slot="{ data: { inventory, lifespan } }"
      :data="data"
      :is-loading="pending"
      :error="error?.message">
      <GearInventorySelection
        v-model="inventoryItem"
        :inventory="inventory"
        :lifespan="lifespan"
        :lost-amount="lostAmount" />
    </WithLazyResource>

    <div class="flex flex-row justify-end mt-3">
      <LoadingButton
        text="Save changes"
        :click-handler="onSubmit"
        data-testid="saveButton" />
    </div>
  </form>
</template>
