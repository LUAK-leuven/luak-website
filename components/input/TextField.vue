<script setup lang="ts">
  import { useField } from 'vee-validate';
  import type { InputTypeHTMLAttribute } from 'vue';
  import Text from '~/components/input/Text.vue';

  const props = withDefaults(
    defineProps<{
      label?: string | undefined;
      type?: InputTypeHTMLAttribute;
      name: string;
      placeholder?: string;
      disabled?: boolean;
      autoFillWithPlaceholder?: boolean;
      round?: boolean;
      autocomplete?: AutoFillField;
    }>(),
    {
      type: 'text',
      placeholder: 'text',
      disabled: false,
      autoFillWithPlaceholder: false,
      label: undefined,
      round: false,
      autocomplete: undefined,
    },
  );

  const { value, errorMessage } = useField<string | undefined>(
    () => props.name,
  );
</script>

<template>
  <Text
    v-model="value"
    :label="label"
    :type="type"
    :error="errorMessage"
    :placeholder="placeholder"
    :disabled="disabled"
    :auto-fill-with-placeholder="autoFillWithPlaceholder"
    :round="round"
    :autocomplete="autocomplete">
    <template #label1>
      <slot name="label-start" />
    </template>
    <template #label-end>
      <slot name="label-end" />
    </template>
  </Text>
</template>
