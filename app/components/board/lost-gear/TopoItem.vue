<script setup lang="ts">
  import Number from '~/components/input/Number.vue';
  import WithLazyResource from '~/components/pages/WithLazyResource.vue';
  import { object as yupObject, number as yupNumber } from 'yup';
  import { ErrorMessage } from 'vee-validate';
  import LoadingButton from '~/components/shared/LoadingButton.vue';
  import type { RentalTopoItem } from '~/model/Rental';

  const props = defineProps<{
    rentalId: RentalId;
    topo: RentalTopoItem;
  }>();

  const { show } = useToast();

  const { data, pending, error } = await useLazyFetch(
    `/api/topos/${props.topo.itemId.id}`,
    { method: 'get' },
  );

  const formSchema = yupObject({
    lostAmount: yupNumber().required().min(1).max(props.topo.unreturnedAmount),
  });

  const { defineField, errors, handleSubmit } = useForm({
    validationSchema: toTypedSchema(formSchema),
    initialValues: { lostAmount: 1 },
  });

  const [lostAmount] = defineField('lostAmount');

  const onSubmit = async () =>
    await handleSubmit(async (formState) => {
      const { error } = await useSupabaseClient().rpc('mark_topo_as_lost', {
        p_lost_amount: formState.lostAmount,
        p_rental_id: props.rentalId,
        p_topo_id: props.topo.itemId.id,
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

  <WithLazyResource
    v-slot="{ data: topoDetails }"
    :data="data"
    :is-loading="pending"
    :error="error?.message">
    <form @submit.prevent>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div data-testId="topo.title">Title: {{ topo.name }}</div>
        <div data-testId="topo.year_published">
          Year: {{ topoDetails.yearPublished }}
        </div>
        <div data-testId="rentedAmount">
          Rented amount: {{ topo.rentedAmount }}
        </div>
        <div data-testId="unreturnedAmount">
          Unreturned amount: {{ props.topo.unreturnedAmount }}
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
  </WithLazyResource>
</template>
