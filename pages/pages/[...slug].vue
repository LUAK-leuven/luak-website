<script setup lang="ts">
  const route = useRoute();
  const { data: doc } = await useAsyncData(route.path, () => {
    return queryCollection('pages').path(route.path).first();
  });
</script>
<template>
  <FullPageCard v-if="doc">
    <template #title>
      {{ doc.title }}
    </template>

    <ContentRenderer class="nuxt-content w-full" :value="doc" />
  </FullPageCard>
  <FullPageCard v-else>
    <template #title> Page Not Found </template>
    <p>Oops! The content you're looking for doesn't exist.</p>
    <NuxtLink class="link" to="/">Go back home</NuxtLink>
  </FullPageCard>
</template>
