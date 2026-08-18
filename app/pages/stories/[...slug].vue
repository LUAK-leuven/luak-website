<script setup lang="ts">
  import BackButton from '~/components/shared/BackButton.vue';

  definePageMeta({
    layout: 'picture',
  });

  const route = useRoute();
  const { data: doc } = await useAsyncData(route.path, async () => {
    return (
      (await queryCollection('stories').path(route.path).first()) ?? undefined
    );
  });
</script>

<template>
  <main>
    <template v-if="doc !== undefined">
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
          <BackButton class="mb-5" :to="{ name: 'stories' }" />
          <ContentRenderer class="nuxt-content" :value="doc" />
        </PageCard>
      </PagesFullPageCardWithPicture>
    </template>

    <PagesPageNotFound v-else class="mt-20" :back-to="{ name: 'stories' }" />
  </main>
</template>
