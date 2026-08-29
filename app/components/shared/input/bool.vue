<script setup lang="ts">
  defineProps<{
    modelValue: boolean;
  }>();
  const emit = defineEmits<{
    'update:modelValue': [value: boolean];
  }>();

  const parseInput = (value: unknown) => {
    if (typeof value === 'boolean') emit('update:modelValue', value);
    else console.error('Invalid type for bool input:', typeof value);
  };
</script>
<template>
  <SharedInput
    :model-value="modelValue"
    type="checkbox"
    @update:model-value="parseInput" />
</template>
