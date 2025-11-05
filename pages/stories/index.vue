<script setup lang="ts">
  import type { NewsContent } from '~/types/content.types';

  const NR_OF_STORIES = 20;
  const { data } = await useAsyncData(() =>
    queryContent<NewsContent>('/stories')
      .sort({ date: -1 })
      .limit(NR_OF_STORIES)
      .find(),
  );
</script>

<template>
  <FullPageCard>
    <template #title> LUAK Stories ⛰️ </template>
    <template #subtitle>
      Want to write your own story? No problem simply mail your story to
      <a
        class="link"
        href="mailto:luak.bestuur@gmail.com?subject=I would like to add a story to the LUAK website&body=Don't forget to also include a title, the author and a picture for the card and background.">
        luak.bestuur@gmail.com</a
      >
      and we will put it on the website. Don't forget to also include some cool
      pictures 😉!
    </template>
    <NewsItem
      v-for="(newsItem, index) in data"
      :key="newsItem._path"
      v-bind="{ data: newsItem, reversed: !!((index + 1) % 2) }" />
  </FullPageCard>
</template>
