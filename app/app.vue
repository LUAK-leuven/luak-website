<script setup lang="ts">
  import { useToast } from '~/composables/useToast';

  const { toasts, close } = useToast();
</script>
<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>

  <ToastNotification
    v-if="toasts.length > 0"
    :type="toasts[0]!.type"
    @close="close(toasts[0]!.id)">
    {{ toasts[0]!.message }}
  </ToastNotification>
</template>
