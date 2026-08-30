<script setup lang="ts">
  import type { TextType } from './TextType';

  defineProps<{
    modelValue: string | undefined;
    type: TextType;
    placeholder: string | undefined;
    disabled?: boolean;
    autocomplete?: AutoFillField | undefined;
    tabindex?: number | undefined;
  }>();
  const emit = defineEmits<{
    'update:modelValue': [value: string | undefined];
    focus: [];
    blur: [];
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
    :placeholder="placeholder"
    :autocomplete="autocomplete"
    :disabled="disabled"
    :tabindex="tabindex"
    @update:model-value="parseInput"
    @focus="() => emit('focus')"
    @blur="() => emit('blur')" />
</template>
