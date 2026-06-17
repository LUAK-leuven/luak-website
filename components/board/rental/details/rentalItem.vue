<script setup lang="ts" generic="T extends GearItemId | TopoId">
  import type { RentalId, RentedItem } from '~/types/rental';
  import { computeRentedItemStatus } from '~/utils/rental/computeStatus';
  import ItemMenu from './ItemMenu.vue';
  import type { GearItemId, TopoId } from '~/types/gear';

  type GetItemType<T> = T extends TopoId
    ? 'topo'
    : T extends GearItemId
      ? 'gear'
      : never;

  const porps = defineProps<{
    item: RentedItem<T>;
    itemType: GetItemType<T>;
    rentalId: RentalId;
  }>();

  const itemStatusColor = computed(() => {
    const itemStatus = computeRentedItemStatus({
      rentedAmount: porps.item.rentedAmount,
      returnedAmount: porps.item.returnedAmount,
      lostAmount: porps.item.lostAmount,
    });
    switch (itemStatus) {
      case 'allReturned':
        return 'bg-green-100';
      case 'noneReturned':
        return 'bg-red-100';
      case 'someReturned':
        return 'bg-yellow-100';
      default:
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        throw createError(`Invalid item status: ${itemStatus}`);
    }
  });
</script>
<template>
  <div class="contents" :data-testId="`rental-item-${item.name}`">
    <div
      class="border p-1 flex flex-col items-start justify-center"
      :class="itemStatusColor">
      {{ item.name }}
      <ul v-if="item.lostAmount > 0" class="ml-5">
        <li data-testid="lostItem">{{ item.lostAmount }} item(s) Lost</li>
      </ul>
    </div>
    <div class="border p-1 flex flex-row justify-between items-center">
      <span>
        <span data-testid="returnedAmount"> {{ item.returnedAmount }} </span> /
        <span data-testId="rentedAmount"> {{ item.rentedAmount }} </span>
      </span>
    </div>
    <div class="border p-1 flex items-center justify-center">
      <ItemMenu
        :item-id="{ id: item.id, type: itemType }"
        :rental-id="rentalId" />
    </div>
  </div>
</template>
