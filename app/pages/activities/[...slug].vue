<script setup lang="ts">
  import FullPageCardWithPicture from '~/components/pages/FullPageCardWithPicture.vue';
  import BackButton from '~/components/shared/BackButton.vue';

  definePageMeta({
    layout: 'picture',
  });

  const route = useRoute();
  const { data: page } = await useAsyncData(route.path, () => {
    return queryCollection('activities').path(route.path).first();
  });
</script>

<template>
  <FullPageCardWithPicture v-if="page" :image-url="page.image">
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
      <BackButton class="mb-5" :to="{ name: 'activities' }" />
      <ContentRenderer class="nuxt-content" :value="page" />
    </PageCard>
  </FullPageCardWithPicture>
  <PagesPageNotFound v-else class="mt-20" :back-to="{ name: 'activities' }" />
</template>
