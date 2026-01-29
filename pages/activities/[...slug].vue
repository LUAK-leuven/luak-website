<script setup lang="ts">
  definePageMeta({
    layout: 'picture',
  });

  const route = useRoute();
  const { data: page } = await useAsyncData(route.path, () => {
    return queryCollection('activities').path(route.path).first();
  });
</script>

<template>
  <template v-if="page">
    <PagesFullPageCardWithPicture :image-url="page.image">
      <template #title>
        <div class="max-w-[90wh]">
          <h1 class="mb-14 text-center text-5xl">
            {{ page.title }}
          </h1>
          <i>{{
            new Date(page.date).toLocaleDateString(undefined, {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })
          }}</i>
        </div>
      </template>

      <PageCard>
        <NuxtLink
          class="btn btn-circle btn-sm btn-outline mb-5"
          to="/activities">
          <span class="material-symbols-outlined"> arrow_back</span>
        </NuxtLink>
        <ContentRenderer class="nuxt-content" :value="page" />
      </PageCard>
    </PagesFullPageCardWithPicture>
  </template>
  <PagesPageNotFound v-else />
</template>
