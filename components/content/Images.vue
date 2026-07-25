<script setup lang="ts">
  defineProps<{
    src: string[];
    caption?: string | undefined;
  }>();
</script>

<template>
  <div class="flex flex-col items-center">
    <div class="flex flex-row flex-wrap justify-center gap-4">
      <NuxtImg v-for="(image, idx) of src" :key="idx" :src="image" />
    </div>
    <p v-if="caption">
      <em>{{ caption }}</em>
    </p>
  </div>
</template>
