<script setup lang="ts">
  import dayjs from 'dayjs';
  import { useBreakpoints, breakpointsTailwind } from '@vueuse/core';
  import InventoryTableItem from '~/components/board/gear/inventoryTableItem.vue';
  import RetirementDate from '~/components/board/gear/retirementDate.vue';
  import RentalsForItem from '~/components/board/inventory/RentalsForItem.vue';
  import ItemHistory from '~/components/board/inventory/ItemHistory.vue';

  const gearItemId = useRoute('board-gear-id').params.id as GearItemId;

  const { data, pending, error } = useLazyFetch(
    () => `/api/gear/inventory/${gearItemId}`,
    {
      method: 'get',
      transform: (x) => x as GearInventoryDetails,
    },
  );

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

  const dipslayLifespan = (lifespan: number): string => {
    if (lifespan === 0) return '-';
    return `${lifespan.toFixed()} years`;
  };
</script>
<template>
  <PagesDetailsPage
    v-slot="{ data: gearItems }"
    title="Gear Details"
    :sub-title="data?.name"
    :data="data"
    :is-loading="pending"
    :error="error?.message"
    :back-to="{ name: 'board-gear' }">
    <div class="flex flex-row flex-wrap justify-between gap-3 mt-3">
      <span data-testid="gearItem-amount">
        Available: {{ gearItems.availableAmount }} /
        {{ gearItems.totalAmount }}
      </span>
      <span> Lifespan: {{ dipslayLifespan(gearItems.lifespan) }} </span>
      <span>Deposit fee: {{ (gearItems.depositFee / 100).toFixed(2) }} €</span>
    </div>

    <hr class="my-3" />
    <h3 class="mb-2">Inventory</h3>
    <ClientOnly>
      <div
        class="grid border rounded-sm overflow-x-scroll"
        :class="
          gearItems.lifespan === 0
            ? 'grid-cols-[3fr_1fr] lg:grid-cols-[4fr_1fr_2fr_2fr]'
            : 'grid-cols-[3fr_1fr_2fr] lg:grid-cols-[4fr_1fr_2fr_2fr_2fr]'
        ">
        <b class="border px-1">Details</b>
        <b class="border px-1">Amount</b>
        <b v-if="lg" class="border px-1">Production date</b>
        <b v-if="lg" class="border px-1">Purchase date</b>
        <b v-if="gearItems.lifespan !== 0" class="border px-1">
          Retirement date
        </b>
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
          } of gearItems.inventory"
          :key="id"
          class="contents"
          data-testid="inventory-row">
          <InventoryTableItem :is-archived="totalAmount <= 0">
            {{ details }}
          </InventoryTableItem>
          <InventoryTableItem
            :is-archived="totalAmount <= 0"
            data-testid="amount">
            {{ totalAmount }}
          </InventoryTableItem>
          <InventoryTableItem v-if="lg" :is-archived="totalAmount <= 0">
            {{ formatDate(productionDate) }}
          </InventoryTableItem>
          <InventoryTableItem v-if="lg" :is-archived="totalAmount <= 0">
            {{ formatDate(purchaseDate) }}
          </InventoryTableItem>
          <InventoryTableItem
            v-if="gearItems.lifespan !== 0"
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

    <template v-if="gearItems.rentals.length > 0">
      <hr class="my-3" />
      <RentalsForItem :rentals="gearItems.rentals" />
    </template>
  </PagesDetailsPage>
</template>
