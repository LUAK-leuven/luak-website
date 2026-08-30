<script setup lang="ts">
  defineProps<{
    modelValue: number | undefined;
    placeholder?: string | undefined;
    disabled?: boolean | undefined;
    autocomplete?: AutoFillField | undefined;
  }>();
  const emit = defineEmits<{
    'update:modelValue': [value: number | undefined];
    focus: [];
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
    :placeholder="placeholder"
    :disabled="disabled"
    :autocomplete="autocomplete"
    @update:model-value="parseInput"
    @focus="() => emit('focus')" />
</template>
