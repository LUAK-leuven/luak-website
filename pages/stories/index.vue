<script setup lang="ts">
  const NR_OF_STORIES = 20;
  const { data } = await useAsyncData(() =>
    queryCollection('stories').order('date', 'DESC').limit(NR_OF_STORIES).all(),
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
        luak.bestuur@gmail.com
      </a>
      and we will put it on the website. Don't forget to also include some cool
      pictures 😉!
    </template>
    <NewsItem
      v-for="(newsItem, index) in data"
      :key="newsItem.path"
      v-bind="{ data: newsItem, reversed: !!((index + 1) % 2) }" />
  </FullPageCard>
</template>
