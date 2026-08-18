<script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount } from 'vue';
  import Button from '../shared/Button.vue';

  withDefaults(
    defineProps<{
      src: string;
      alt?: string | undefined;
      caption?: string | undefined;
      fullscreen?: boolean;
    }>(),
    {
      alt: undefined,
      caption: undefined,
      fullscreen: false,
    },
  );

  const container = ref<HTMLElement | null>(null);
  const isFullscreen = ref(false);

  const enterFullscreen = async () => {
    if (!container.value) return;

    try {
      await container.value.requestFullscreen();
    } catch (error) {
      console.error('Unable to enter fullscreen mode:', error);
    }
  };

  const exitFullscreen = async () => {
    if (!document.fullscreenElement) return;

    try {
      await document.exitFullscreen();
    } catch (error) {
      console.error('Unable to exit fullscreen mode:', error);
    }
  };

  const toggleFullscreen = async () => {
    if (document.fullscreenElement) {
      await exitFullscreen();
    } else {
      await enterFullscreen();
    }
  };

  const handleFullscreenChange = () => {
    isFullscreen.value = document.fullscreenElement === container.value;
  };

  onMounted(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange);
  });

  onBeforeUnmount(() => {
    document.removeEventListener('fullscreenchange', handleFullscreenChange);
  });
</script>

<template>
  <figure
    ref="container"
    class="flex flex-col items-center m-2 mb-4"
    :class="{
      'justify-center': isFullscreen,
    }">
    <div class="relative" :class="isFullscreen ? 'size-full' : 'size-fit'">
      <Button
        v-if="fullscreen"
        class="absolute right-2 top-2 z-10 size-8 rounded-full bg-black/60 text-white border-0"
        type="button"
        :aria-label="isFullscreen ? 'Exit fullscreen' : 'View fullscreen'"
        :title="isFullscreen ? 'Exit fullscreen' : 'View fullscreen'"
        @click="toggleFullscreen">
        <span
          v-if="isFullscreen"
          class="material-symbols-outlined text-lg"
          style="font-variation-settings: 'wght' 500">
          fullscreen_exit
        </span>
        <span
          v-else
          class="material-symbols-outlined text-lg font-black"
          style="font-variation-settings: 'wght' 500">
          fullscreen
        </span>
      </Button>
      <NuxtImg
        class="custom-img"
        :class="
          isFullscreen
            ? 'size-full object-contain'
            : 'rounded-lg shadow-2xl max-w-60 max-h-60 md:max-w-80 md:max-h-80'
        "
        :src="src"
        :alt="alt">
      </NuxtImg>
    </div>

    <figcaption
      v-if="caption !== undefined"
      class="mt-2 max-w-60 max-h-60 md:max-w-80 md:max-h-80 text-center">
      <em>{{ caption }}</em>
    </figcaption>
  </figure>
</template>
