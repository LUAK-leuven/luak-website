<script setup lang="ts">
  const NR_OF_ARTICLES = 20;
  const { data } = await useAsyncData(() =>
    queryCollection('news').order('date', 'DESC').limit(NR_OF_ARTICLES).all(),
  );
</script>

<template>
  <FullPageCard>
    <template #title> News </template>
    <NewsItem
      v-for="(newsItem, index) in data"
      :key="newsItem.path"
      v-bind="{ data: newsItem, reversed: !!((index + 1) % 2) }" />
  </FullPageCard>
</template>
