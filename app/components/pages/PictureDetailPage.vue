<script
  setup
  lang="ts"
  generic="T extends Pick<PictureDocument, 'title' | 'image' | 'date'>">
  import type { RoutesNamedLocations } from '@typed-router';

  import BackButton from '~/components/shared/BackButton.vue';
  import type { PictureDocument } from '~/composables/useContentDocument';
  import { formatLongDate } from '~/utils/formatLongDate';

  defineProps<{
    doc: T;
    backTo: RoutesNamedLocations;
  }>();
</script>
<template>
  <PagesFullPageCardWithPicture :image-url="doc.image">
    <template #title>
      <div class="flex flex-col items-center max-w-[90vw]">
        <h1 class="mb-10 text-center text-5xl">
          {{ doc.title }}
        </h1>
        <div class="flex flex-wrap justify-center gap-x-5">
          <i>{{ formatLongDate(doc.date) }}</i>
          <slot name="meta" :doc="doc" />
        </div>
      </div>
    </template>

    <PageCard>
      <BackButton class="mb-5" :to="backTo" />
      <ContentRenderer class="nuxt-content w-full" :value="doc" />
    </PageCard>
  </PagesFullPageCardWithPicture>
</template>
