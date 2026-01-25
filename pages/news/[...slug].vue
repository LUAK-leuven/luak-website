<script setup lang="ts">
  definePageMeta({
    layout: 'picture',
  });

  const route = useRoute();
  const { data: doc } = await useAsyncData(route.path, () => {
    return queryCollection('news').path(route.path).first();
  });
</script>

<template>
  <template v-if="doc">
    <PagesFullPageCardWithPicture :image-url="doc.image">
      <template #title>
        <div class="max-w-[90wh]">
          <h1 class="mb-14 text-center text-5xl">
            {{ doc.title }}
          </h1>
          <i>{{
            new Date(doc.date).toLocaleDateString(undefined, {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })
          }}</i>
        </div>
      </template>

      <PageCard>
        <NuxtLink class="btn btn-circle btn-sm btn-outline mb-5" to="/news">
          <span class="material-symbols-outlined">arrow_back</span>
        </NuxtLink>
        <ContentRenderer class="nuxt-content" :value="doc" />
      </PageCard>
    </PagesFullPageCardWithPicture>
  </template>
  <PagesPageNotFound v-else arrow_back="/news" />
</template>
