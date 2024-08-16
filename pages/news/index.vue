<script setup lang="ts">
import type { NewsContent } from "~/types/content.types";

const NR_OF_ARTICLES = 20;
const { data } = await useAsyncData(() =>
  queryContent<NewsContent>("/news")
    .sort({ date: -1 })
    .limit(NR_OF_ARTICLES)
    .find(),
);
</script>

<template>
  <FullPageCard>
    <template #title> News </template>
    <NewsItem
      v-for="(newsItem, index) in data"
      :key="newsItem._path"
      v-bind="{ data: newsItem, reversed: !!((index + 1) % 2) }"
    />
  </FullPageCard>
</template>
