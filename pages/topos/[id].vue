<script setup lang="ts">
  import type { Enums } from '~/types/database.types';
  import type { TopoId } from '~/types/gear';

  definePageMeta({ middleware: 'active-member-guard' });

  const { data: user } = await useLuakMember();
  const topoId = useRoute().params.id as TopoId;
  const { data, pending, error } = await gearService().getTopo(topoId);

  const conditionMap: Record<Enums<'topo_condition'>, string> = {
    as_good_as_new: 'New',
    good: 'Good',
    used: 'Used',
    damaged: 'Damaged',
  };
</script>

<template>
  <FullPageCard>
    <template #subtitle>
      <h2>{{ data?.title ?? 'Topo' }}</h2>
      <i class="text-sm">{{ data ? data.authors.join(', ') : '' }}</i>
    </template>

    <SharedBackButton to="/topos/library" />

    <div class="h-2"></div>

    <PagesWithLazyResource
      v-slot="{ data: topo }"
      :data="data"
      :is-loading="pending"
      :error="error?.message">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-3 mt-2 mb-4">
        <p class="sm:col-span-2">{{ topo.details }}</p>
        <TopoLibraryTopoDetailItem name="Types of climbing">
          <span>{{ topo.types_of_climbing.join(', ') }}</span>
        </TopoLibraryTopoDetailItem>
        <TopoLibraryTopoDetailItem name="Countries">
          <span>{{ topo.countries.join(', ') }}</span>
        </TopoLibraryTopoDetailItem>
        <TopoLibraryTopoDetailItem name="Condition">
          <span
            class="badge"
            :class="{
              'badge-success':
                topo.condition === 'as_good_as_new' ||
                topo.condition === 'good',
              'badge-warning': topo.condition === 'used',
              'badge-error': topo.condition === 'damaged',
            }">
            {{ conditionMap[topo.condition] }}
          </span>
        </TopoLibraryTopoDetailItem>
        <TopoLibraryTopoDetailItem name="Amount">
          <span class="badge badge-ghost">{{ topo.amount }}</span>
        </TopoLibraryTopoDetailItem>
        <TopoLibraryTopoDetailItem name="Languages">
          <span>{{ topo.languages.join(', ') }}</span>
        </TopoLibraryTopoDetailItem>
        <TopoLibraryTopoDetailItem name="Place in library">
          <span>{{ topo.place_in_library }}</span>
        </TopoLibraryTopoDetailItem>
        <TopoLibraryTopoDetailItem name="Tags">
          <span>{{ topo.tags.join(', ') }}</span>
        </TopoLibraryTopoDetailItem>
        <TopoLibraryTopoDetailItem name="Year published">
          <span class="badge badge-info">{{ topo.year_published }}</span>
        </TopoLibraryTopoDetailItem>
      </div>

      <template v-if="user.isBoard">
        <hr />
        <div class="flex flex-row justify-center mt-2">
          <i class="text-sm w-fit">{{ topo.id }}</i>
        </div>
      </template>
    </PagesWithLazyResource>
  </FullPageCard>
</template>
