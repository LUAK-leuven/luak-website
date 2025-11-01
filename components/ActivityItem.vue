<script setup lang="ts">
  import type { ActivityContent } from '~/types/content.types';

  const props = defineProps<{
    data: ActivityContent;
  }>();
  const priceString = computed(() => {
    if (props.data.price === 0) {
      return 'Free';
    } else if (typeof props.data.price === 'number') {
      return `${props.data.price / 100} €`;
    } else {
      return ' - €';
    }
  });
</script>

<template>
  <NuxtLink
    :key="data._path"
    class="card card-compact bg-base-200 w-full sm:w-80 shadow-xl my-5 md:mx-5 hover:shadow-2xl"
    :to="data._path">
    <figure>
      <NuxtImg class="h-56 object-cover w-full" :src="data.image" />
      <figcaption v-if="data.tag" class="absolute top-3 right-3">
        <div class="badge badge-info badge-lg">
          {{ data.tag }}
        </div>
      </figcaption>
    </figure>
    <div class="card-body">
      <h2 class="card-title">{{ data.title }}</h2>
      <!-- <ContentRenderer :value="data" :excerpt="true" class="py-6 nuxt-content">
        <template #empty>
          <p>Press the read more button to lean more!.</p>
        </template>
        <template #error>
          <p>An error occurred while rendering the content.</p>
        </template>
      </ContentRenderer> -->
      <div class="flex justify-between my-2">
        <div class="flex flex-col">
          <span class="italic text-xs">Date</span>
          <div class="badge badge-primary badge-lg">
            {{
              new Date(data.date).toLocaleDateString(undefined, {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
              })
            }}
          </div>
        </div>
        <div class="flex flex-col items-end">
          <span class="italic text-xs">Price</span>
          <div class="badge badge-primary badge-lg badge-outline">
            {{ priceString }}
          </div>
        </div>
      </div>
      <div class="card-actions justify-center">
        <!-- <NuxtLink class="btn btn-outline" :key="data._path" :to="data._path"
          >More info</NuxtLink
        > -->
        <div class="btn btn-outline">More info</div>
      </div>
    </div>
  </NuxtLink>
</template>
