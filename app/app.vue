<script setup lang="ts">
  import { useToast } from '~/composables/useToast';

  const { toasts, close, pauseToast, resumeToast } = useToast();
</script>
<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>

  <div
    v-if="toasts.length > 0"
    class="toast toast-bottom toast-end z-50 w-[90%] mx-[5%] md:w-[80%] md:mx-[10%]">
    <ToastNotification
      v-for="toast in toasts"
      :key="toast.id"
      :type="toast.type"
      :progress="toast.progress"
      @close="close(toast.id)"
      @pause="pauseToast(toast.id)"
      @resume="resumeToast(toast.id)">
      {{ toast.message }}
    </ToastNotification>
  </div>
</template>
