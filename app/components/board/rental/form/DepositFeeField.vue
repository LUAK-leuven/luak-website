<script setup lang="ts">
  import Text from '~/components/input/Text.vue';

  const props = defineProps<{
    computedDeposit: number;
  }>();

  const model = defineModel<number | undefined>({ required: true });

  const autoFillPlaceholder = () => {
    if (model.value === undefined) model.value = props.computedDeposit;
  };
</script>
<template>
  <Text
    v-model="model"
    label="Deposit fee *"
    type="number"
    :placeholder="computedDeposit.toFixed()"
    @focus="autoFillPlaceholder">
    <template #label1><span class="mr-1">€</span></template>
  </Text>
</template>
