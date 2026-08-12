<script setup lang="ts">
  import type { RoutesNamedLocations } from '@typed-router';
  import Button from './Button.vue';

  defineProps<{ to: RoutesNamedLocations | undefined }>();

  const router = useRouter();
</script>
<template>
  <Button
    v-if="to === undefined"
    class="btn btn-circle btn-sm btn-outline"
    @click="() => router.back()">
    <span class="material-symbols-outlined">arrow_back</span>
  </Button>
  <NuxtLink v-else class="btn btn-circle btn-sm btn-outline" :to="to">
    <span class="material-symbols-outlined">arrow_back</span>
  </NuxtLink>
</template>
