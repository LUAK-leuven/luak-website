<script setup lang="ts">
  import type { Enums } from '~/types/database.types';
  import type { TopoId } from '~/types/gear';

  definePageMeta({ middleware: 'active-member-guard' });

  const { data: user } = await useLuakMember();
  const topoId = useRoute().params.id as TopoId;
  const { data: topo, pending } = await gearService().getTopo(topoId);

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
      <h2>{{ topo?.title ?? 'Topo' }}</h2>
      <i class="text-sm">{{ topo ? topo.authors.join(', ') : '' }}</i>
    </template>

    <NuxtLink
      class="absolute btn btn-circle btn-sm btn-outline top-10 left-10"
      to="/topos/library">
      <span class="material-symbols-outlined">arrow_back</span>
    </NuxtLink>

    <div class="h-2"></div>

    <div v-if="pending" class="flex justify-center">
      <span class="loading loading-spinner loading-lg" />
    </div>
    <div v-else-if="!topo">ERROR!</div>
    <div
      v-else
      class="grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-3 mt-2 mb-4">
      <p class="col-span-2">{{ topo.details }}</p>
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
              topo.condition === 'as_good_as_new' || topo.condition === 'good',
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
        <i class="text-sm w-fit">{{ topo?.id }}</i>
      </div>
    </template>
  </FullPageCard>
</template>
