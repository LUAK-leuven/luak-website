<script setup lang="ts">
  import { ErrorMessage } from 'vee-validate';
  import { number as yupNumber, object as yupObject } from 'yup';

  import type { RentalId } from '#shared/api/rest/rental';
  import { createTopoId } from '#shared/api/rest/topo';
  import Number from '~/components/input/NumberCompact.vue';
  import LoadingButton from '~/components/shared/LoadingButton.vue';
  import type { RentalItem } from '~/model/Rental';

  const props = defineProps<{
    rentalId: RentalId;
    topo: RentalItem;
  }>();

  const { show } = useToast();
  const gearService = useGearService();
  const supabase = useSupabaseClient();

  const topoId = await useRequiredAsyncData(
    'lost-gear-getTopoId',
    async () => {
      const { data } = await supabase
        .from('Inventory')
        .select('Topos(id)')
        .eq('rental_item_id', props.topo.id)
        .single()
        .throwOnError();
      if (data.Topos === null) throw new Error('Failed to get topo ID');
      return createTopoId(data.Topos.id);
    },
    { errorMessage: () => 'Failed to get topo ID' },
  );

  const formSchema = yupObject({
    lostAmount: yupNumber().required().min(1).max(props.topo.outstandingAmount),
  });

  const { defineField, errors, handleSubmit } = useForm({
    validationSchema: toTypedSchema(formSchema),
    initialValues: { lostAmount: 1 },
  });

  const [lostAmount] = defineField('lostAmount');

  const onSubmit = async () =>
    await handleSubmit(async (formState) => {
      const { error } = await gearService.markAsLost({
        rentalItemId: props.topo.id,
        rentalId: props.rentalId,
        inventoryItemId: topoId.value,
        lostAmount: formState.lostAmount,
      });

      if (error) {
        console.error(error.message);
        show('error', 'Failed to save changes');
      } else {
        await navigateTo({
          name: 'board-rentals-id',
          params: { id: props.rentalId },
        });
      }
    })();
</script>
<template>
  <h2 class="text-center">Topo</h2>

  <form @submit.prevent>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div data-testId="topo.title">Title: {{ topo.name }}</div>
      <div data-testId="rentedAmount">
        Rented amount: {{ topo.rentedAmount }}
      </div>
      <div data-testId="unreturnedAmount">
        Unreturned amount: {{ props.topo.outstandingAmount }}
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
    <div class="flex flex-row justify-end mt-3">
      <LoadingButton
        text="Save changes"
        :click-handler="onSubmit"
        data-testId="saveButton" />
    </div>
  </form>
</template>
