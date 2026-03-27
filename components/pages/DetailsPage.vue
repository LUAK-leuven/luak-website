<script setup lang="ts" generic="T extends { id: EntityId<unknown> } | null">
  import type { EntityId } from '~/types/ddd';

  defineProps<{
    title?: string;
    subTitle?: string;
    data: T;
    isLoading: boolean;
    error?: string;
    backTo?: string;
  }>();
</script>
<template>
  <FullPageCard>
    <template v-if="title" #title>
      {{ title }}
    </template>

    <template v-if="subTitle" #subtitle>
      <h2 class="mt-0">{{ subTitle }}</h2>
      <i class="text-sm">{{ data?.id }}</i>
    </template>

    <SharedBackButton v-if="backTo" :to="backTo" />

    <PagesWithLazyResource
      v-slot="{ data: data_ }"
      :data="data"
      :is-loading="isLoading"
      :error="error">
      <slot :data="data_" />
    </PagesWithLazyResource>
  </FullPageCard>
</template>
