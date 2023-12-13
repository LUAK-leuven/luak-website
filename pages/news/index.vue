<script setup>
const NR_OF_ARTICLES = 5;
const { data } = await useAsyncData(() =>
  queryContent("/news")
    .only(["title", "image", "excerpt", "_path"])
    .limit(NR_OF_ARTICLES)
    .find()
);
</script>

<template>
  <div class="relative flex flex-wrap justify-center z-2 bg-base-300">
    <div class="bg-base-100 basis-9/12 shrink-0 grow-0 rounded my-28">
      <h1 class="w-full text-center text-7xl m-10">News</h1>
      <div v-for="(newsItem, index) in data" :key="newsItem._path">
        <NewsItem v-bind="{ ...newsItem, reversed: !!(index % 2) }" />
        <div class="divider my-5 mx-20" v-if="index < NR_OF_ARTICLES - 1"></div>
      </div>
    </div>
  </div>
</template>
