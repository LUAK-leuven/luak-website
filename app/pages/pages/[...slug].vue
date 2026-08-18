<script setup lang="ts">
  import PageNotFound from '~/components/pages/PageNotFound.vue';

  const route = useRoute();
  const { data: doc } = await useAsyncData(route.path, () => {
    return queryCollection('pages').path(route.path).first();
  });
  if (doc.value === null || doc.value === undefined) {
    throw createError({ statusCode: 404, statusMessage: 'Page Not Found' });
  }
</script>
<template>
  <FullPageCard v-if="doc">
    <template #title>
      {{ doc.title }}
    </template>

    <ContentRenderer class="nuxt-content w-full" :value="doc" />
  </FullPageCard>
  <PageNotFound v-else />
</template>
