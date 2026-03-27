<script setup lang="ts">
  defineProps<{ to: string }>();
</script>
<template>
  <NuxtLink
    class="absolute btn btn-circle btn-sm btn-outline top-10 left-10"
    :to="to">
    <span class="material-symbols-outlined">arrow_back</span>
  </NuxtLink>
</template>
