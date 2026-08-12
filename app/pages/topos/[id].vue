<script setup lang="ts">
  import ItemHistory from '~/components/board/inventory/ItemHistory.vue';
  import RentalsForItem from '~/components/board/inventory/RentalsForItem.vue';
  import BackButton from '~/components/shared/BackButton.vue';
  import TopoCondition from '~/components/topoLibrary/TopoCondition.vue';

  definePageMeta({ middleware: 'active-member-guard' });

  const luakUser = await useUserService().getMembershipInfo();
  const isBoard = computed(() => luakUser.value.permissions.boardSection);

  const topoId = useRoute('topos-id').params.id as TopoId;
  const { data, pending, error } = await useLazyFetch(`/api/topos/${topoId}`, {
    method: 'get',
  });

  const availableAmount = computed(() => {
    if (data.value === undefined) return -1;
    else return data.value.amount - sumOf(data.value.rentals, 'rentedAmount');
  });
</script>

<template>
  <FullPageCard>
    <template #subtitle>
      <h2>{{ data?.title ?? 'Topo' }}</h2>
      <i class="text-sm">{{ data ? data.authors.join(', ') : '' }}</i>
    </template>

    <BackButton class="absolute top-10 left-10" :to="undefined" />

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
          <span v-if="!isBoard" class="badge badge-ghost" data-testid="amount">
            {{ topo.amount }}
          </span>
          <span
            v-else
            class="badge"
            :class="availableAmount > 0 ? 'badge-success' : 'badge-error'"
            data-testid="amount">
            {{ availableAmount }} / {{ topo.amount }}
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
          <span class="badge badge-info">{{ topo.yearPublished ?? 'NA' }}</span>
        </TopoLibraryTopoDetailItem>
      </div>
      <template v-if="isBoard">
        <hr class="my-3" />
        <h3>History</h3>
        <ItemHistory
          :events="topo.events"
          purchase-date="??"
          :initial-amount="topo.initialAmount"
          data-testid="history" />

        <template v-if="topo.rentals.length > 0">
          <hr class="mt-3" />
          <RentalsForItem :rentals="topo.rentals" />
        </template>
      </template>
      <hr class="my-3" />
      <div class="flex flex-row justify-center">
        <i class="text-sm w-fit">{{ topo.id }}</i>
      </div>
    </PagesWithLazyResource>
  </FullPageCard>
</template>
