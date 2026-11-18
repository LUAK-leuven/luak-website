<script setup lang="ts">
  const doc = await useContentDocument('infoPages');
</script>

<template>
  <PagesTextDetailPage :doc="doc" />
</template>
