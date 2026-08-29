<script setup lang="ts">
  import FormInput from './FormInput.vue';

  withDefaults(
    defineProps<{
      label?: string | undefined;
      error?: string | undefined;
      placeholder?: string;
      disabled?: boolean;
      round?: boolean;
      autocomplete?: AutoFillField | undefined;
    }>(),
    {
      placeholder: '',
      disabled: false,
      label: undefined,
      round: false,
      error: undefined,
      autocomplete: undefined,
    },
  );

  const model = defineModel<number | undefined>({ required: true });

  const emit = defineEmits<{
    focus: [];
  }>();
</script>

<template>
  <FormInput :label="label" :error="error" :disabled="disabled" :round="round">
    <slot name="label-start" />
    <SharedInputNumber
      v-model="model"
      class="w-full"
      :class="{ 'bg-gray-300': disabled }"
      :placeholder="placeholder"
      :disabled="disabled"
      :autocomplete="autocomplete"
      @focus="() => emit('focus')" />
    <slot name="label-end" />
  </FormInput>
</template>
