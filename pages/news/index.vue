<script setup>
const NR_OF_ARTICLES = 5;
const { data } = await useAsyncData(() =>
  queryContent("/news")
    .only(["title", "image", "excerpt", "_path"])
    .limit(NR_OF_ARTICLES)
    .find(),
);
</script>

<template>
  <div class="relative flex flex-wrap justify-center z-2 bg-base-300">
    <h1 class="w-full text-center text-5xl mt-28 p-10 fixed z-0">News</h1>
    <div
      class="bg-base-100 shadow-md md:basis-9/12 basis-11/12 shrink-0 grow-0 rounded mb-28 z-10 mt-72"
    >
      <NewsItem
        v-for="(newsItem, index) in data"
        :key="newsItem._path"
        v-bind="{ data: newsItem, reversed: !!((index + 1) % 2) }"
      />
    </div>
  </div>
</template>
