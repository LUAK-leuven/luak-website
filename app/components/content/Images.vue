<script setup lang="ts">
  import FullscreenImage from './FullscreenImage.vue';

  const props = withDefaults(
    defineProps<{
      images: { src: string; caption?: string; alt?: string }[];
      groupCaption?: string | undefined;
      fullscreen?: boolean;
    }>(),
    { groupCaption: undefined, fullscreen: true },
  );

  const noCaptions = computed(
    () =>
      props.groupCaption === undefined &&
      props.images.every((image) => image.caption === undefined),
  );
</script>

<template>
  <div class="flex flex-col items-center">
    <div
      class="flex flex-row flex-wrap justify-center items-center gap-x-4"
      :class="{ 'mb-4': noCaptions }">
      <FullscreenImage
        v-for="({ src, caption, alt }, idx) of images"
        :key="idx"
        :src="src"
        :caption="caption"
        :fullscreen="fullscreen"
        :alt="alt" />
    </div>
    <p v-if="groupCaption !== undefined" class="max-w-[80%] text-center">
      <em>{{ groupCaption }}</em>
    </p>
  </div>
</template>
