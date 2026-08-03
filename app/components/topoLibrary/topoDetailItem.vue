<script setup lang="ts">
  defineProps<{ name: string }>();
</script>
<template>
  <div class="flex flex-row flex-wrap items-center gap-x-4">
    <i>{{ name }}:</i>
    <slot />
  </div>
</template>
