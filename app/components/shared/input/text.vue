<script setup lang="ts">
  import type { TextType } from './TextType';

  defineProps<{
    modelValue: string | undefined;
    type: TextType;
  }>();
  const emit = defineEmits<{
    'update:modelValue': [value: string | undefined];
  }>();

  const parseInput = (value: unknown) => {
    if (value === '') emit('update:modelValue', undefined);
    if (typeof value === 'string') emit('update:modelValue', value);
    else console.error('Invalid type for text input:', typeof value);
  };
</script>
<template>
  <SharedInput
    :model-value="modelValue"
    :type="type"
    @update:model-value="parseInput" />
</template>
