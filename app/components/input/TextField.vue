<script setup lang="ts">
  import { useField } from 'vee-validate';
  import Text from '~/components/input/Text.vue';
  import type { TextType } from '~/components/shared/input/TextType';

  const props = withDefaults(
    defineProps<{
      label?: string | undefined;
      type?: TextType;
      name: string;
      placeholder?: string;
      disabled?: boolean;
      round?: boolean;
      autocomplete?: AutoFillField | undefined;
    }>(),
    {
      type: 'text',
      placeholder: 'text',
      disabled: false,
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
    :round="round"
    :autocomplete="autocomplete">
    <template #label-start>
      <slot name="label-start" />
    </template>
    <template #label-end>
      <slot name="label-end" />
    </template>
  </Text>
</template>
