<script setup lang="ts">
defineProps<{
  title: string;
  image?: string;
  excerpt: Object;
  _path: string;
}>();
</script>

<template>
  <div class="hero bg-base-100 m-10 w-fit">
    <div class="hero-content flex-col lg:flex-row">
      <NuxtImg :src="image" class="max-w-sm rounded-lg shadow-2xl" />
      <div>
        <h1 class="text-4xl text-gray-600">{{ title }}</h1>
        <p class="py-6">
          <ContentRendererMarkdown :value="excerpt" />
        </p>
        <NuxtLink :to="_path">
          <button class="btn btn-outline">read more</button>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
