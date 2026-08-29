<script setup lang="ts">
  withDefaults(
    defineProps<{
      label?: string | undefined;
      error?: string | undefined;
      disabled?: boolean;
      round?: boolean;
    }>(),
    {
      disabled: false,
      label: undefined,
      round: false,
      error: undefined,
    },
  );
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
      <slot />
    </label>
    <span v-if="error" class="text-error" data-testId="error-message">
      {{ error }}
    </span>
  </div>
</template>
