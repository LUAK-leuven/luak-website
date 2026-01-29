<script setup lang="ts">
  const route = useRoute();
  const { data: doc } = await useAsyncData(route.path, () => {
    return queryCollection('info_').path(route.path).first();
  });
</script>
<template>
  <main>
    <template v-if="doc">
      <FullPageCard>
        <template #title>
          {{ doc.title }}
        </template>
        <ContentRenderer class="nuxt-content w-full" :value="doc" />
      </FullPageCard>
    </template>
    <PagesPageNotFound v-else />
  </main>
</template>
