<script setup lang="ts">
  definePageMeta({
    layout: 'picture',
  });

  const doc = await useContentDocument('news');
</script>

<template>
  <PagesPictureDetailPage :doc="doc" :back-to="{ name: 'news' }" />
</template>
