<script setup lang="ts">
  import type { RoutesNamedLocations } from '@typed-router';
  import BackButton from '../shared/BackButton.vue';

  defineProps<{ backTo?: RoutesNamedLocations | undefined }>();
</script>
<template>
  <FullPageCard>
    <template #title> Page Not Found </template>

    <BackButton v-if="backTo !== undefined" :to="backTo" />

    <div class="text-center">
      <p>Oops! The content you're looking for doesn't exist.</p>
      <NuxtLink class="link" :to="{ name: 'index' }">Go back home</NuxtLink>
    </div>
  </FullPageCard>
</template>
