<script setup lang="ts">
  import type { NewsCollectionItem } from '@nuxt/content';

  defineProps<{
    data: NewsCollectionItem;
    reversed?: boolean;
  }>();
</script>

<template>
  <div class="bg-base-100 my-5">
    <div
      class="flex justify-center items-center align-middle flex-col"
      :class="[reversed ? 'md:flex-row' : 'md:flex-row-reverse']">
      <NuxtLink :key="data.path" class="m-5" :to="data.path">
        <NuxtImg
          class="rounded-lg shadow-2xl max-w-72 max-h-72 md:max-w-80 md:max-h-80"
          :src="data.image"
          :placeholder="384" />
      </NuxtLink>
      <div>
        <h1 class="text-4xl text-gray-600">{{ data.title }}</h1>
        <p v-if="data.teaser">{{ data.teaser }}</p>
        <ContentRenderer
          v-else-if="data.excerpt"
          class="py-6 nuxt-content"
          :value="data"
          :excerpt="true">
          <template #empty>
            <p>{{ data.teaser }}</p>
          </template>
          <template #error>
            <p>An error occurred while rendering the content.</p>
          </template>
        </ContentRenderer>
        <div class="flex justify-center">
          <NuxtLink :key="data.path" class="btn btn-outline" :to="data.path">
            read more
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
  <div class="divider my-5 mx-20" />
</template>
