<script setup lang="ts">
  import type { RentalId } from '#shared/api/rest/rental.ts';
  import ItemMenu from '~/components/board/rental/details/ItemMenu.vue';
  import getItemColor from '~/components/board/rental/getItemColor.js';
  import type { RentalItem } from '~/model/Rental.js';

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
      {{ item.name }}
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
      <ItemMenu
        :item-id="item.id"
        :rental-id="rentalId"
        :item-type="item.type" />
    </div>
  </div>
</template>
