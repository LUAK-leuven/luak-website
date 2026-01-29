<script setup lang="ts">
  definePageMeta({
    layout: 'picture',
  });

  const route = useRoute();
  const { data: doc } = await useAsyncData(route.path, () => {
    return queryCollection('stories').path(route.path).first();
  });
</script>

<template>
  <main>
    <template v-if="doc">
      <PagesFullPageCardWithPicture :image-url="doc.image">
        <template #title>
          <div class="max-w-[90wh] flex flex-col items-center">
            <h1 class="mb-10 text-center text-5xl">
              {{ doc.title }}
            </h1>
            <div
              class="flex gap-x-5 justify-between flex-wrap-reverse md:max-w-[70vw] max-w-[90vw] w-full">
              <i>{{
                new Date(doc.date).toLocaleDateString(undefined, {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })
              }}</i>
              <i>By: {{ doc.author }}</i>
            </div>
          </div>
        </template>

        <PageCard>
          <NuxtLink
            class="btn btn-circle btn-sm btn-outline mb-5"
            to="/stories">
            <span class="material-symbols-outlined"> arrow_back</span>
          </NuxtLink>
          <ContentRenderer class="nuxt-content" :value="doc" />
        </PageCard>
      </PagesFullPageCardWithPicture>
    </template>

    <PagesPageNotFound v-else arrow_back="/stories" />
  </main>
</template>
