<script setup lang="ts">
  const props = defineProps<{
    softMin?: number;
    hardMin?: number;
    softMax?: number;
    hardMax?: number;
    clampInput: boolean;
  }>();
  const model = defineModel<number>({ required: true });

  const getTextboxColor: () => string = () => {
    if (
      (props.hardMin !== undefined && model.value < props.hardMin) ||
      (props.hardMax !== undefined && model.value > props.hardMax)
    )
      return 'input-error';
    if (
      (props.softMin !== undefined && model.value < props.softMin) ||
      (props.softMax !== undefined && model.value > props.softMax)
    )
      return 'input-warning';
    return '';
  };

  const clampAmount: () => number = () => {
    if (props.hardMin !== undefined && model.value < props.hardMin)
      return props.hardMin;
    if (props.hardMax !== undefined && model.value > props.hardMax)
      return props.hardMax;
    return model.value;
  };
</script>

<template>
  <label class="form-control max-w-20">
    <input
      v-model="model"
      class="input input-bordered border-2 h-8"
      :class="getTextboxColor()"
      type="number"
      @focusout="if (clampInput) model = clampAmount();" />
  </label>
</template>
