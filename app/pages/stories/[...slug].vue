<script setup lang="ts">
  definePageMeta({
    layout: 'picture',
  });

  const doc = await useContentDocument('stories');
</script>

<template>
  <PagesPictureDetailPage :doc="doc" :back-to="{ name: 'stories' }">
    <template #meta="{ doc: story }">
      <i>By: {{ story.author }}</i>
    </template>
  </PagesPictureDetailPage>
</template>
