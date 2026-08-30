<script setup lang="ts">
  import type { TextType } from '~/components/shared/input/TextType.ts';
  import FormInput from './FormInput.vue';

  withDefaults(
    defineProps<{
      label?: string | undefined;
      type?: TextType;
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

  const model = defineModel<string | undefined>({ required: true });

  const emit = defineEmits<{
    focus: [];
  }>();
</script>

<template>
  <FormInput :label="label" :error="error" :disabled="disabled" :round="round">
    <slot name="label-start" />
    <SharedInputText
      v-model="model"
      class="w-full"
      :class="{ 'bg-gray-300': disabled }"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      :autocomplete="autocomplete"
      @focus="() => emit('focus')" />
    <slot name="label-end" />
  </FormInput>
</template>
