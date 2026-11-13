<script setup lang="ts">
  const doc = await useContentDocument('pages');
</script>
<template>
  <PagesTextDetailPage :doc="doc" />
</template>
