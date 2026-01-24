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
      <div
        class="hero min-h-[80vh] fixed z-10"
        :style="`background-image: url(${doc.image}); background-size: cover`">
        <div class="hero-overlay bg-opacity-60" />
        <div class="hero-content text-left text-neutral-content my-20">
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
        </div>
      </div>
      <div class="min-h-[80vh] min-w-full" />
      <div class="relative flex flex-wrap justify-center z-2 bg-base-300">
        <div
          class="bg-base-100 shadow-md md:basis-9/12 basis-11/12 shrink-0 grow-0 z-20 rounded-lg mb-20"
          style="margin-top: -12em">
          <div class="p-10">
            <NuxtLink
              class="btn btn-circle btn-sm btn-outline mb-5"
              to="/stories">
              <span class="material-symbols-outlined"> arrow_back</span>
            </NuxtLink>
            <ContentRenderer class="nuxt-content" :value="doc" />
          </div>
        </div>
      </div>
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
