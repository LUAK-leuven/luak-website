<script setup lang="ts">
  import type { RentalId, RentalItemId } from '~/types/rental';

  defineProps<{
    rentalId: RentalId;
    itemId: RentalItemId;
  }>();
</script>
<template>
  <div class="dropdown dropdown-end">
    <button
      class="btn btn-circle btn-xs btn-ghost"
      tabindex="0"
      data-testid="rentalItemMenuButton">
      <span class="material-symbols-outlined">more_vert</span>
    </button>
    <ul
      class="dropdown-content menu bg-base-100 rounded-box w-36 p-1 shadow-sm text-sm"
      tabindex="0">
      <li>
        <NuxtLink
          class="text-error"
          :to="{
            name: 'board-lost-gear',
            query: {
              rentalId: rentalId,
              itemType: itemId.type,
              itemId: itemId.id,
            },
          }"
          data-testid="markAsLost">
          Mark as lost
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>
