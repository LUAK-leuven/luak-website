<script setup lang="ts">
  import type { RoutesNamedLocations } from '@typed-router';

  defineProps<{ to: RoutesNamedLocations }>();
</script>
<template>
  <NuxtLink class="btn btn-circle btn-sm btn-outline" :to="to">
    <span class="material-symbols-outlined">arrow_back</span>
  </NuxtLink>
</template>
