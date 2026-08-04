<script setup lang="ts">
  import type { InputTypeHTMLAttribute } from 'vue';
  import Input from '../shared/Input.vue';

  withDefaults(
    defineProps<{
      label?: string | undefined;
      type?: InputTypeHTMLAttribute;
      error?: string | undefined;
      placeholder?: string;
      disabled?: boolean;
      round?: boolean;
      autocomplete?: AutoFillField | undefined;
    }>(),
    {
      type: 'text',
      placeholder: '',
      disabled: false,
      label: undefined,
      round: false,
      error: undefined,
      autocomplete: undefined,
    },
  );

  const model = defineModel<string | number | undefined>();

  const emit = defineEmits<{
    focus: [];
  }>();

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
      <Input
        v-model="model"
        class="w-full"
        :class="{ 'bg-gray-300': disabled }"
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        :autocomplete="autocomplete"
        @focus="() => emit('focus')" />
      <slot name="label-end" />
    </label>
    <span v-if="error" class="text-error" data-testId="error-message">
      {{ error }}
    </span>
  </div>
</template>
