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
  <main>
    <template v-if="page">
      <div
        class="hero min-h-[80vh] fixed z-10"
        :style="`background-image: url(${page.image}); background-size: cover`">
        <div class="hero-overlay bg-opacity-60" />
        <div class="hero-content text-left text-neutral-content my-20">
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
        </div>
      </div>
      <div class="min-h-[80vh] min-w-full" />
      <div class="relative flex flex-wrap justify-center z-2 bg-base-300">
        <div
          class="bg-base-100 shadow-md md:basis-9/12 basis-11/12 shrink-0 grow-0 z-20 rounded mb-20"
          style="margin-top: -12em">
          <div class="p-10">
            <NuxtLink
              class="btn btn-circle btn-sm btn-outline mb-5"
              to="/activities">
              <span class="material-symbols-outlined"> arrow_back</span>
            </NuxtLink>
            <ContentRenderer class="nuxt-content" :value="page" />
          </div>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="hero min-h-[80vh] fixed z-10">
        <div class="hero-overlay bg-opacity-60" />
        <div class="hero-content text-left text-neutral-content my-20">
          <div class="max-w-[90wh]">
            <h1 class="mb-14 text-center text-5xl">Page Not Found</h1>
          </div>
        </div>
      </div>
      <div class="min-h-[80vh] min-w-full" />
      <div class="relative flex flex-wrap justify-center z-2 bg-base-300">
        <div
          class="bg-base-100 shadow-md md:basis-9/12 basis-11/12 shrink-0 grow-0 z-20 rounded mb-20"
          style="margin-top: -12em">
          <div class="p-10">
            <NuxtLink
              class="btn btn-circle btn-sm btn-outline mb-5"
              to="/activities">
              <span class="material-symbols-outlined"> arrow_back</span>
            </NuxtLink>
            <p>Oops! The content you're looking for doesn't exist.</p>
            <NuxtLink to="/">Go back home</NuxtLink>
          </div>
        </div>
      </div>
    </template>
  </main>
</template>
