<script setup lang="ts">
  import NumberField from '~/components/input/NumberField.vue';

  const props = defineProps<{
    computedDeposit: number;
  }>();

  const model = defineModel<number | undefined>({ required: true });

  const autoFillPlaceholder = () => {
    if (model.value === undefined) model.value = props.computedDeposit;
  };
</script>
<template>
  <NumberField
    v-model="model"
    label="Deposit fee *"
    :placeholder="computedDeposit.toFixed()"
    @focus="autoFillPlaceholder">
    <template #label-start><span class="mr-1">€</span></template>
  </NumberField>
</template>
