<script setup lang="ts">
defineProps<{
  data: {
    title: string;
    image?: string;
    excerpt: object;
    _path: string;
  };
  reversed?: boolean;
}>();
</script>

<template>
  <div class="hero bg-base-100 m-10 w-fit">
    <div
      class="hero-content flex-col"
      :class="[reversed ? 'lg:flex-row' : 'lg:flex-row-reverse']"
    >
      <NuxtImg
        :src="data.image"
        class="rounded-lg shadow-2xl max-w-96 max-h-96"
        :placeholder="384"
      />
      <div>
        <h1 class="text-4xl text-gray-600">{{ data.title }}</h1>
        <ContentRenderer :value="data" :excerpt="true" class="py-6" />
        <span />
        <NuxtLink :key="data._path" :to="data._path" class="btn btn-outline"
          >read more</NuxtLink
        >
      </div>
    </div>
  </div>
  <div class="divider my-5 mx-20" />
</template>
