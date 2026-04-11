<script setup lang="ts" generic="T extends { id: EntityId<unknown> } | null">
  import type { EntityId } from '~/types/ddd';

  withDefaults(
    defineProps<{
      title?: string;
      subTitle?: string;
      data: T;
      isLoading: boolean;
      error?: string;
      backTo?: string;
      defaultError?: string | undefined;
    }>(),
    {
      defaultError: undefined,
      title: undefined,
      subTitle: undefined,
      error: undefined,
      backTo: undefined,
    },
  );
</script>
<template>
  <FullPageCard>
    <template v-if="title" #title>
      {{ title }}
    </template>

    <template v-if="subTitle" #subtitle>
      <h2 class="mt-0">{{ subTitle }}</h2>
      <i class="text-sm" data-testId="detailsPage.id">{{ data?.id }}</i>
    </template>

    <SharedBackButton v-if="backTo" :to="backTo" />

    <PagesWithLazyResource
      v-slot="{ data: data_ }"
      :data="data"
      :is-loading="isLoading"
      :error="error"
      :default-error="defaultError">
      <slot :data="data_" />
    </PagesWithLazyResource>
  </FullPageCard>
</template>
