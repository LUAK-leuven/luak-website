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
    }>(),
    {
      type: 'text',
      placeholder: 'text',
      disabled: false,
    },
  );

  const { value, errorMessage } = useField(() => props.name);
</script>

<template>
  <label class="form-control w-full mb-2">
    <div class="label">
      <span class="label-text">{{ label }}</span>
    </div>
    <input
      v-model="value"
      class="input input-bordered w-full"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled" />
    <span class="text-error">{{ errorMessage }}</span>
  </label>
</template>
