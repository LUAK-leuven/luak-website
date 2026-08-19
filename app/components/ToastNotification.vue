<script setup lang="ts">
  import Button from './shared/Button.vue';

  defineProps<{
    type: 'success' | 'warning' | 'error' | 'info';
  }>();
  const emit = defineEmits<{
    close: [];
  }>();
</script>

<template>
  <div
    class="alert flex justify-between"
    :class="{
      'alert-info': type === 'info',
      'alert-success': type === 'success',
      'alert-warning': type === 'warning',
      'alert-error': type === 'error',
    }"
    role="alert"
    data-testid="toast">
    <slot />
    <Button
      class="btn btn-sm btn-circle btn-ghost text-xl self-center items-end"
      data-testid="toast-close-button"
      @click="emit('close')">
      ✕
    </Button>
  </div>
</template>
