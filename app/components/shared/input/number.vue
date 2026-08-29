<script setup lang="ts">
  defineProps<{
    modelValue: number | undefined;
  }>();
  const emit = defineEmits<{
    'update:modelValue': [value: number | undefined];
  }>();

  const parseInput = (value: unknown) => {
    if (value === '') emit('update:modelValue', undefined);
    else if (typeof value === 'number') emit('update:modelValue', value);
    else console.error('Invalid type for number input:', typeof value);
  };
</script>
<template>
  <SharedInput
    :model-value="modelValue"
    type="number"
    @update:model-value="parseInput" />
</template>
