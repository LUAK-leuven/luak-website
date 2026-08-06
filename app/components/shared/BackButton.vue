<script setup lang="ts">
  import type { RoutesNamedLocations } from '@typed-router';

  defineProps<{ to: RoutesNamedLocations }>();
</script>
<template>
  <NuxtLink
    class="absolute btn btn-circle btn-sm btn-outline top-10 left-10"
    :to="to">
    <span class="material-symbols-outlined">arrow_back</span>
  </NuxtLink>
</template>
