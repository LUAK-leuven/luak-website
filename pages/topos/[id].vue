<script setup lang="ts">
  import TopoCondition from '~/components/topoLibrary/TopoCondition.vue';
  import type { TopoId } from '~/types/gear';

  definePageMeta({ middleware: 'active-member-guard' });

  const topoId = useRoute().params.id as TopoId;
  const { data, pending, error } = await gearService().getTopoDetails(topoId);
</script>

<template>
  <FullPageCard>
    <template #subtitle>
      <h2>{{ data?.title ?? 'Topo' }}</h2>
      <i class="text-sm">{{ data ? data.authors.join(', ') : '' }}</i>
    </template>

    <SharedBackButton :to="{ name: 'topos-library' }" />

    <div class="h-2"></div>

    <PagesWithLazyResource
      v-slot="{ data: topo }"
      :data="data"
      :is-loading="pending"
      :error="error?.message">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-3 mt-2 mb-4">
        <p class="sm:col-span-2">{{ topo.details }}</p>
        <TopoLibraryTopoDetailItem name="Types of climbing">
          <span>{{ topo.typesOfClimbing.join(', ') }}</span>
        </TopoLibraryTopoDetailItem>
        <TopoLibraryTopoDetailItem name="Countries">
          <span>{{ topo.countries.join(', ') }}</span>
        </TopoLibraryTopoDetailItem>
        <TopoLibraryTopoDetailItem name="Condition">
          <TopoCondition :topo-condition="topo.condition" />
        </TopoLibraryTopoDetailItem>
        <TopoLibraryTopoDetailItem name="Amount">
          <span class="badge badge-ghost" data-testid="amount">
            {{ topo.amount }}
          </span>
        </TopoLibraryTopoDetailItem>
        <TopoLibraryTopoDetailItem name="Languages">
          <span>{{ topo.languages.join(', ') }}</span>
        </TopoLibraryTopoDetailItem>
        <TopoLibraryTopoDetailItem name="Place in library">
          <span>{{ topo.placeInLibrary }}</span>
        </TopoLibraryTopoDetailItem>
        <TopoLibraryTopoDetailItem name="Tags">
          <span>{{ topo.tags.join(', ') }}</span>
        </TopoLibraryTopoDetailItem>
        <TopoLibraryTopoDetailItem name="Year published">
          <span class="badge badge-info">{{ topo.yearPublished }}</span>
        </TopoLibraryTopoDetailItem>
      </div>
      <hr class="my-3" />
      <div class="flex flex-row justify-center">
        <i class="text-sm w-fit">{{ topo.id }}</i>
      </div>
    </PagesWithLazyResource>
  </FullPageCard>
</template>
