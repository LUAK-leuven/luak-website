<script setup lang="ts">
  import type { TopoId } from '~/types/gear';

  definePageMeta({ middleware: 'active-member-guard' });

  const user = await useLuakMember();
  const topoId = useRoute().params.id as TopoId;
  const { data: topo, pending } = await gearService().getTopo(topoId);
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
    <div v-else class="grid">
      <p>Amount: {{ topo.amount }}</p>
      <p v-if="user.isBoard">Condition: {{ topo.condition }}</p>
      <p>Countries: {{ topo.countries.join(', ') }}</p>
      <p>Details: {{ topo.details }}</p>
      <p>Languages: {{ topo.languages.join(', ') }}</p>
      <p v-if="user.isBoard">Place in library: {{ topo.place_in_library }}</p>
      <p>Tags: {{ topo.tags.join(', ') }}</p>
      <p>Types of climbing: {{ topo.types_of_climbing.join(', ') }}</p>
      <p>Year published: {{ topo.year_published }}</p>
    </div>
    <template v-if="user.isBoard">
      <hr />
      <div class="flex flex-row justify-center mt-2">
        <i class="text-sm w-fit">{{ topo?.id }}</i>
      </div>
    </template>
  </FullPageCard>
</template>
