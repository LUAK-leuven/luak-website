<script setup lang="ts">
  import type { RentalId } from '#shared/api/rest/rental';
  import type {
    RentalItemId,
    RentalItemType,
  } from '#shared/api/rest/rental/rentalItem';
  import Button from '~/components/shared/Button.vue';

  defineProps<{
    rentalId: RentalId;
    itemId: RentalItemId;
    itemType: RentalItemType;
  }>();
</script>
<template>
  <div class="dropdown dropdown-end">
    <Button
      class="btn btn-circle btn-xs btn-ghost"
      :tabindex="0"
      data-testId="rentalItemMenuButton">
      <span class="material-symbols-outlined">more_vert</span>
    </Button>
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
              itemType: itemType,
              itemId: itemId,
            },
          }"
          data-testId="markAsLost">
          Mark as lost
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>
