<script setup lang="ts">
  import { computeRentedItemStatus } from '~/utils/rental/computeStatus';

  const porps = defineProps<{
    name: string;
    rentedAmount: number;
    returnedAmount: number;
    lostAmount: number;
  }>();

  const itemStatusColor = computed(() => {
    const itemStatus = computeRentedItemStatus({
      rentedAmount: porps.rentedAmount,
      returnedAmount: porps.returnedAmount,
      lostAmount: porps.lostAmount,
    });
    switch (itemStatus) {
      case 'allReturned':
        return 'bg-green-100';
      case 'noneReturned':
        return 'bg-red-100';
      case 'someReturned':
        return 'bg-yellow-100';
      default:
        throw Error();
    }
  });
</script>
<template>
  <div class="contents" :data-testId="`rental-item-${name}`">
    <div
      class="border p-1 flex flex-col items-start justify-center"
      :class="itemStatusColor">
      {{ name }}
      <ul v-if="lostAmount > 0" class="ml-5">
        <li data-testid="lostItem">{{ lostAmount }} item(s) Lost</li>
      </ul>
    </div>
    <div
      class="border p-1 flex flex-row justify-between items-center"
      data-testId="rentedAmount">
      <span>{{ rentedAmount }}</span>
    </div>
    <div class="border p-1 flex flex-row items-center">
      <span data-testId="returnedAmount">{{ returnedAmount }}</span>
    </div>
  </div>
</template>
