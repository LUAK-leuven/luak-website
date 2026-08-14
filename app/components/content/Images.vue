<script setup lang="ts">
  import FullscreenImage from './FullscreenImage.vue';

  withDefaults(
    defineProps<{
      images: { src: string; caption?: string }[];
      groupCaption?: string | undefined;
      fullscreen?: boolean;
    }>(),
    { groupCaption: undefined, fullscreen: true },
  );
</script>

<template>
  <div class="flex flex-col items-center">
    <div class="flex flex-row flex-wrap justify-center gap-4">
      <FullscreenImage
        v-for="({ src, caption }, idx) of images"
        :key="idx"
        :src="src"
        :caption="caption"
        :fullscreen="fullscreen" />
    </div>
    <p v-if="groupCaption !== undefined">
      <em>{{ groupCaption }}</em>
    </p>
  </div>
</template>
