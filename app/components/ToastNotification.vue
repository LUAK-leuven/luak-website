<script setup lang="ts">
  import Button from './shared/Button.vue';

  const { type, paused } = defineProps<{
    type: 'success' | 'warning' | 'error' | 'info';
    paused?: boolean;
  }>();
  const emit = defineEmits<{
    close: [];
  }>();
</script>

<template>
  <div
    class="alert relative flex justify-between overflow-hidden"
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
    <div
      class="toast-progress absolute bottom-0 left-0 h-1 w-full bg-current opacity-50"
      :style="{ animationPlayState: paused === true ? 'paused' : 'running' }"
      data-testid="toast-progress" />
  </div>
</template>
