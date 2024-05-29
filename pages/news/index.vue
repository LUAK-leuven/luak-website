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
    <FullPageCard>
      <template #title>
        News
      </template>
      <NewsItem
      v-for="(newsItem, index) in data"
      :key="newsItem._path"
      v-bind="{ data: newsItem, reversed: !!((index + 1) % 2) }"
    />
    </FullPageCard>
</template>
