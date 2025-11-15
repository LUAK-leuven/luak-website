<script setup lang="ts">
  import { useField } from 'vee-validate';

  const props = defineProps({
    label: {
      type: String,
      default: 'text',
    },
    type: {
      type: String,
      default: 'text',
    },
    name: {
      type: String,
      required: true,
    },
    placeholder: {
      type: String,
      default: 'text',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  });

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
