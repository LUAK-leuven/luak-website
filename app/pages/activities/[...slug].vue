<script setup lang="ts">
  definePageMeta({
    layout: 'picture',
  });

  const doc = await useContentDocument('activities');
</script>

<template>
  <PagesPictureDetailPage :doc="doc" :back-to="{ name: 'activities' }" />
</template>
