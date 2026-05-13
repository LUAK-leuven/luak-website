<script setup lang="ts">
  import TextField from '~/components/input/TextField.vue';
  import type { RentalId } from '~/types/rental';
  import type { GearInventoryId, GearItemId } from '~/types/gear';
  import LoadingButton from '~/components/shared/LoadingButton.vue';
  import { useLostGearForm } from '~/composables/board/useLostGearForm';
  import type { Database } from '~/types/database.types';
  import type { EntityId } from '~/types/ddd';

  const emit = defineEmits<{
    submit: [
      rentalId: RentalId,
      gearItemId: GearItemId,
      inventoryId: GearInventoryId,
      dateLost: string,
      lostAmount: number,
    ];
  }>();

  type GetTablesWithId<T extends Record<string, { Row: unknown }>> = {
    [K in keyof T]: T[K]['Row'] extends { id: string } ? K : never;
  }[keyof T];

  const getIds = async <Id extends EntityId<unknown>>(
    table: GetTablesWithId<Database['public']['Tables']>,
  ) => {
    const { data } = await useAsyncData(
      `${table}-ids`,
      async () => {
        const { data, error } = await useSupabaseClient()
          .from(table)
          .select('id');
        if (error)
          throw new Error(`Failed to fetch ${table} ids`, { cause: error });
        return data.map(({ id }) => id as Id);
      },
      { lazy: true },
    );
    return computed(() => data.value ?? []);
  };

  const rentalIds = await getIds<RentalId>('Rentals');
  const gearItemIds = await getIds<GearItemId>('GearItems');
  const inventoryIds = await getIds<GearInventoryId>('GearInventory');

  const { handleSubmit } = useLostGearForm(
    rentalIds,
    gearItemIds,
    inventoryIds,
  );

  const onSubmit: () => Promise<void> = handleSubmit(
    (formState) => {
      console.log(formState);
      emit(
        'submit',
        formState.rentalId,
        formState.gearItemId,
        formState.inventoryId,
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
  <form @submit.prevent>
    <TextField
      name="rentalId"
      label="Rental id:"
      placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
      data-testId="rental-id" />
    {{ rentalIds }}
    <TextField
      name="gearItemId"
      label="Gear item id:"
      placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
      data-testId="gear-item-id" />
    {{ gearItemIds }}
    <TextField
      name="inventoryId"
      label="Gear inventory id:"
      placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
      data-testId="inventory-id" />
    {{ inventoryIds }}
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
      <LoadingButton
        text="Submit"
        :click-handler="onSubmit"
        data-testId="submit" />
    </div>
  </form>
</template>
