<script setup lang="ts">
  import type { InputTypeHTMLAttribute } from 'vue';

  withDefaults(
    defineProps<{
      label?: string | undefined;
      type?: InputTypeHTMLAttribute;
      error?: string;
      placeholder?: string;
      disabled?: boolean;
      autoFillWithPlaceholder?: boolean;
      round?: boolean;
    }>(),
    {
      type: 'text',
      placeholder: '',
      disabled: false,
      autoFillWithPlaceholder: false,
      label: undefined,
      round: false,
      error: undefined,
    },
  );

  const model = defineModel<string | number>();

  watch(model, (value) => {
    if (value === '') model.value = undefined;
  });
</script>

<template>
  <div class="form-control w-full">
    <div v-if="label" class="label">
      <span class="label-text">{{ label }}</span>
    </div>
    <label
      class="input input-bordered w-full flex items-center"
      :class="{
        'bg-gray-300': disabled,
        'rounded-full': round,
        'input-error': error,
      }">
      <slot name="label1" />
      <input
        v-model="model"
        class="w-full"
        :class="{ 'bg-gray-300': disabled }"
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        @focus="if (autoFillWithPlaceholder && !model) model = placeholder;" />
      <slot name="label-end" />
    </label>
    <span v-if="error" class="text-error">{{ error }}</span>
  </div>
</template>
