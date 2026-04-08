<script setup lang="ts">
  import { useToast } from '~/composables/useToast';

  const { state, close } = useToast();
</script>
<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>

  <ToastNotification
    v-if="state !== undefined"
    :type="state.type"
    @close="close">
    {{ state.message }}
  </ToastNotification>
</template>
