<script setup lang="ts">
import { ref, onMounted } from "vue";

import {useResiz}
const { $textfit } = useNuxtApp();
// the name must match template ref value
const textfit_h1 = ref(null);

onMounted(() => {
  useResizeObserver(el, (entries) => {
  const entry = entries[0]
  const { width, height } = entry.contentRect
  text.value = `width: ${width}, height: ${height}`
})
  $textfit(textfit_h1.value);
});
</script>
<template>
  <main>
    <ContentDoc v-slot="{ doc }">
      <div
        class="hero h-[80vh] fixed z-10"
        :style="`background-image: url(${doc.image}); background-size: cover`"
      >
        <div class="hero-overlay h-[80vh] bg-opacity-60"></div>
        <div class="hero-content text-left text-neutral-content w-11/12 my-20">
          <h1
            class="mb-14 text-center h-[40vh] w-full overflow-hidden"
            ref="textfit_h1"
          >
            {{ doc.title }}
          </h1>
        </div>
      </div>
      <div class="h-[80vh] min-w-full"></div>
      <div class="relative flex flex-wrap justify-center z-2 bg-base-300">
        <div
          class="bg-base-100 shadow-md md:basis-9/12 basis-11/12 shrink-0 grow-0 z-20 rounded mb-20"
          style="margin-top: -10em"
        >
          <div class="p-10">
            <ContentRenderer :value="doc" />
          </div>
        </div>
      </div>
    </ContentDoc>
  </main>
</template>
