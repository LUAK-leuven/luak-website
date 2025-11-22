<script setup lang="ts">
  import { useField } from 'vee-validate';
  import type { InputTypeHTMLAttribute } from 'vue';

  const props = withDefaults(
    defineProps<{
      label: string;
      type?: InputTypeHTMLAttribute;
      name: string;
      placeholder?: string;
      disabled?: boolean;
      autoFillWithPlaceholder?: boolean;
    }>(),
    {
      type: 'text',
      placeholder: 'text',
      disabled: false,
      autoFillWithPlaceholder: false,
    },
  );

  const { value, errorMessage } = useField(() => props.name);
  effect(() => {
    if (value.value === '') value.value = undefined;
  });
</script>

<template>
  <div class="form-control w-full mb-2">
    <div class="label">
      <span class="label-text">{{ label }}</span>
    </div>
    <label
      class="input input-bordered w-full flex items-center"
      :class="disabled ? 'bg-gray-300' : ''">
      <slot name="label1" />
      <input
        v-model="value"
        class="w-min"
        :class="disabled ? 'bg-gray-300' : ''"
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        @focus="if (autoFillWithPlaceholder && !value) value = placeholder;" />
    </label>
    <span v-if="errorMessage" class="text-error">{{ errorMessage }}</span>
  </div>
</template>
