<script setup lang="ts">
  import Number from '~/components/input/Number.vue';
  import WithLazyResource from '~/components/pages/WithLazyResource.vue';
  import type { RentalDetails } from '~/types/rental';
  import { object as yupObject, number as yupNumber } from 'yup';
  import { ErrorMessage } from 'vee-validate';

  const props = defineProps<{
    topo: RentalDetails['topos'][number];
  }>();

  const { data, pending, error } = await gearService().getTopoDetails(
    props.topo.id,
  );

  const unReturnedAmount = computed(
    () => props.topo.rentedAmount - props.topo.returnedAmount,
  );

  const formSchema = yupObject({
    lostAmount: yupNumber().required().min(1).max(unReturnedAmount.value),
  });

  const { defineField, errors } = useForm({
    validationSchema: toTypedSchema(formSchema),
    initialValues: { lostAmount: 1 },
  });

  const [lostAmount] = defineField('lostAmount');
</script>
<template>
  <h2 class="text-center">Topo</h2>

  <WithLazyResource
    v-slot="{ data: topoDetails }"
    :data="data"
    :is-loading="pending"
    :error="error?.message">
    <form>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>Title: {{ topo.title }}</div>
        <div>Year: {{ topoDetails.year_published }}</div>
        <div>Rented amount: {{ topo.rentedAmount }}</div>
        <div>Unreturned amount: {{ unReturnedAmount }}</div>
        <div>
          <div class="col-span-full flex flex-row gap-2 items-center">
            Lost amount:
            <Number
              v-model="lostAmount"
              :text-box-color="errors.lostAmount ? 'input-error' : ''" />
          </div>
          <ErrorMessage class="text-error" name="lostAmount" />
        </div>
      </div>
    </form>
  </WithLazyResource>
</template>
