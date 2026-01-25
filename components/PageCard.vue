<script setup lang="ts">
  defineProps<{ class?: string }>();
</script>
<template>
  <div
    class="relative bg-base-100 shadow-md md:w-9/12 w-11/12 shrink-0 grow-0 rounded-xl p-10"
    :class="class">
    <slot />
  </div>
</template>
