<script setup lang="ts">
  import ItemMenu from './ItemMenu.vue';
  import type { RentalItem } from '~/model/Rental.js';
  import getItemColor from '../getItemColor.js';

  const props = defineProps<{
    item: RentalItem;
    rentalId: RentalId;
  }>();

  const itemStatusColor = computed(() => getItemColor(props.item));
</script>
<template>
  <div class="contents" :data-testId="`rental-item-${item.name}`">
    <div
      class="border p-1 flex flex-col items-start justify-center"
      :class="itemStatusColor">
      {{ item.displayName }}
      <ul v-if="item.lostAmount > 0" class="ml-5">
        <li data-testId="lostItem">{{ item.lostAmount }} item(s) Lost</li>
      </ul>
    </div>
    <div class="border p-1 flex flex-row justify-between items-center">
      <span>
        <span data-testId="returnedAmount"> {{ item.returnedAmount }} </span> /
        <span data-testId="rentedAmount"> {{ item.rentedAmount }} </span>
      </span>
    </div>
    <div class="border p-1 flex items-center justify-center">
      <ItemMenu :item-id="item.itemId" :rental-id="rentalId" />
    </div>
  </div>
</template>
