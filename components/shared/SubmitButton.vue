<script setup lang="ts">
  withDefaults(
    defineProps<{
      text: string;
      disabled?: boolean;
      isLoading: boolean;
    }>(),
    { disabled: false },
  );
</script>
<template>
  <button
    class="btn btn-primary w-fit"
    :class="{ 'btn-disabled': disabled }"
    :disabled="disabled"
    type="submit">
    <span
      v-if="isLoading"
      class="loading loading-spinner"
      data-testId="loading">
      loading
    </span>
    <span v-else data-testId="button-text">{{ text }}</span>
  </button>
</template>
