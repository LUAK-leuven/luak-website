<script setup lang="ts">
  import { breakpointsTailwind, useBreakpoints } from '@vueuse/core';
  import dayjs from 'dayjs';

  import ItemHistory from '~/components/board/inventory/ItemHistory.vue';
  import RetirementDate from '~/components/board/gear/retirementDate.vue';
  import InventoryTableItem from '~/components/board/gear/inventoryTableItem.vue';

  const props = defineProps<{
    hasInfiniteLifespan: boolean;
    inventory: GearInventoryDetails['inventory'];
  }>();

  const sortedInventory = computed(() => {
    return props.inventory.toSorted((a, b) => {
      if (a.totalAmount <= 0 && b.totalAmount > 0) return 1;
      if (a.totalAmount > 0 && b.totalAmount <= 0) return -1;
      if (a.totalAmount <= 0 && b.totalAmount <= 0) {
        if (
          a.retirementDate === 'infinite' ||
          a.retirementDate === 'missing info'
        )
          return 1;
        if (
          b.retirementDate === 'infinite' ||
          b.retirementDate === 'missing info'
        )
          return -1;
        return dayjs(a.retirementDate).isBefore(b.retirementDate) ? 1 : -1;
      }
      if (
        a.retirementDate === 'infinite' ||
        a.retirementDate === 'missing info'
      )
        return -1;
      if (
        b.retirementDate === 'infinite' ||
        b.retirementDate === 'missing info'
      )
        return 1;
      return dayjs(a.retirementDate).isBefore(b.retirementDate) ? -1 : 1;
    });
  });

  const bp = useBreakpoints(breakpointsTailwind);
  const lg = computed(() => bp.lg.value);

  const formatDate = (date: string | undefined): string => {
    if (date === undefined) return '';
    return dayjs(date).format('DD-MM-YYYY');
  };

  const displayPurchaseDate = (args: {
    purchaseDate: string | undefined;
    productionDate: string | undefined;
  }) => {
    if (args.purchaseDate !== undefined)
      return dayjs(args.purchaseDate).format('DD-MM-YYYY');
    if (args.productionDate !== undefined)
      return `> ${dayjs(args.productionDate).format('DD-MM-YYYY')}`;
    return '??';
  };
</script>
<template>
  <ClientOnly>
    <div
      class="grid border rounded-sm overflow-x-scroll"
      :class="
        hasInfiniteLifespan
          ? 'grid-cols-[3fr_1fr] lg:grid-cols-[4fr_1fr_2fr_2fr]'
          : 'grid-cols-[3fr_1fr_2fr] lg:grid-cols-[4fr_1fr_2fr_2fr_2fr]'
      ">
      <b class="border px-1">Details</b>
      <b class="border px-1">Amount</b>
      <b v-if="lg" class="border px-1">Production date</b>
      <b v-if="lg" class="border px-1">Purchase date</b>
      <b v-if="!hasInfiniteLifespan" class="border px-1"> Retirement date </b>
      <div
        v-for="{
          id,
          details,
          initialAmount,
          totalAmount,
          productionDate,
          purchaseDate,
          retirementDate,
          events,
        } of sortedInventory"
        :key="id"
        class="contents"
        data-testId="inventory-row">
        <InventoryTableItem :is-archived="totalAmount <= 0">
          {{ details }}
        </InventoryTableItem>
        <InventoryTableItem
          :is-archived="totalAmount <= 0"
          data-testId="amount">
          {{ totalAmount }}
        </InventoryTableItem>
        <InventoryTableItem v-if="lg" :is-archived="totalAmount <= 0">
          {{ formatDate(productionDate) }}
        </InventoryTableItem>
        <InventoryTableItem v-if="lg" :is-archived="totalAmount <= 0">
          {{ formatDate(purchaseDate) }}
        </InventoryTableItem>
        <InventoryTableItem
          v-if="!hasInfiniteLifespan"
          :is-archived="totalAmount <= 0">
          <RetirementDate :retirement-date="retirementDate" />
        </InventoryTableItem>

        <InventoryTableItem
          class="col-span-full border-t-0"
          :is-archived="totalAmount <= 0">
          <ItemHistory
            :events="events"
            :purchase-date="
              displayPurchaseDate({ purchaseDate, productionDate })
            "
            :initial-amount="initialAmount" />
        </InventoryTableItem>
      </div>
    </div>
  </ClientOnly>
</template>
