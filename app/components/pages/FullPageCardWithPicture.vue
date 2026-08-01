<script setup lang="ts">
  defineProps<{ imageUrl: string }>();
</script>
<template>
  <div
    class="hero min-h-[80vh] fixed mt-[-80px]"
    :style="`background-image: url(${imageUrl}); background-size: cover`">
    <div class="hero-overlay bg-opacity-60" />
    <div class="hero-content text-left text-neutral-content my-20">
      <slot name="title" />
    </div>
  </div>
  <div class="relative flex flex-col items-center pt-[50vh]">
    <slot />
  </div>
</template>
