<script setup lang="ts">
  import Button from './shared/Button.vue';

  const { type, progress } = defineProps<{
    type: 'success' | 'warning' | 'error' | 'info';
    progress: number;
  }>();
  const emit = defineEmits<{
    close: [];
    pause: [];
    resume: [];
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
    data-testId="toast"
    @mouseenter="emit('pause')"
    @mouseleave="emit('resume')">
    <slot />
    <Button
      class="btn btn-sm btn-circle btn-ghost text-xl self-center items-end"
      data-testId="toast-close-button"
      @click="emit('close')">
      ✕
    </Button>
    <div
      class="absolute bottom-0 left-0 h-1 bg-current opacity-50 transition-[width] duration-100 ease-linear"
      :style="{ width: `${progress * 100}%` }"
      data-testId="toast-progress" />
  </div>
</template>
