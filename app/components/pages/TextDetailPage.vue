<script setup lang="ts" generic="T extends Pick<ContentDocument, 'title'>">
  import type { ContentDocument } from '~/composables/useContentDocument';

  defineProps<{ doc: T }>();
</script>
<template>
  <FullPageCard>
    <template #title>
      {{ doc.title }}
    </template>
    <ContentRenderer class="nuxt-content w-full" :value="doc" />
  </FullPageCard>
</template>
