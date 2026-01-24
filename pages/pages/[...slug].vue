<script setup lang="ts">
  const route = useRoute();
  const { data: doc } = await useAsyncData(route.path, () => {
    return queryCollection('pages').path(route.path).first();
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
    <template v-else>
      <FullPageCard>
        <template #title> Page Not Found </template>
        <p>Oops! The content you're looking for doesn't exist.</p>
        <NuxtLink to="/">Go back home</NuxtLink>
      </FullPageCard>
    </template>
  </main>
</template>
