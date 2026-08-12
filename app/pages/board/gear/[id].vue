<script setup lang="ts">
  import dayjs, { type Dayjs } from 'dayjs';
  import { useBreakpoints, breakpointsTailwind } from '@vueuse/core';
  import InventoryTableItem from '~/components/board/gear/inventoryTableItem.vue';
  import RetirementDate from '~/components/board/gear/retirementDate.vue';
  import RentalsForItem from '~/components/board/inventory/RentalsForItem.vue';
  import ItemHistory from '~/components/board/inventory/ItemHistory.vue';

  const gearItemId = useRoute('board-gear-id').params.id as GearItemId;

  const {
    data: data_,
    pending,
    error,
  } = useLazyFetch(() => `/api/gear/inventory/${gearItemId}`, {
    method: 'get',
    transform: (x) => x as GearInventoryDetails,
  });
  const data = computed(() =>
    data_.value
      ? {
          ...data_.value,
          inventory: data_.value.inventory
            .map((x) => {
              const productionDate = x.productionDate
                ? dayjs(x.productionDate)
                : undefined;
              const purchaseDate = x.purchaseDate
                ? dayjs(x.purchaseDate)
                : undefined;
              const retirementDate = x.retirementDate
                ? dayjs(x.retirementDate)
                : undefined;
              return {
                ...x,
                productionDate,
                purchaseDate,
                retirementDate,
              };
            })
            .sort((a, b) => {
              if (
                a.retirementDate === undefined &&
                b.retirementDate === undefined
              )
                return 0;
              if (a.retirementDate === undefined) return -1;
              if (b.retirementDate === undefined) return 1;
              if (a.retirementDate.isSame(b.retirementDate)) return 0;
              if (a.retirementDate.isBefore(b.retirementDate)) return 1;
              return -1;
            }),
        }
      : null,
  );

  const bp = useBreakpoints(breakpointsTailwind);
  const lg = computed(() => bp.lg.value);

  const displayPurchaseDate = (args: {
    purchaseDate: Dayjs | undefined;
    productionDate: Dayjs | undefined;
  }) => {
    if (args.purchaseDate) return args.purchaseDate.format('DD-MM-YYYY');
    if (args.productionDate)
      return `> ${args.productionDate.format('DD-MM-YYYY')}`;
    return '??';
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
      <span>Lifespan: {{ gearItems.lifespan }} years</span>
      <span>Deposit fee: {{ (gearItems.depositFee / 100).toFixed(2) }} €</span>
    </div>

    <hr class="my-3" />
    <h3 class="mb-2">Inventory</h3>
    <ClientOnly>
      <div
        class="grid grid-cols-[3fr_1fr_2fr] lg:grid-cols-[4fr_1fr_2fr_2fr_2fr] border rounded-sm overflow-x-scroll">
        <b class="border px-1">Details</b>
        <b class="border px-1">Amount</b>
        <b v-if="lg" class="border px-1">Production date</b>
        <b v-if="lg" class="border px-1">Purchase date</b>
        <b class="border px-1">Retirement date</b>
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
            {{ productionDate?.format('MMM YYYY') }}
          </InventoryTableItem>
          <InventoryTableItem v-if="lg" :is-archived="totalAmount <= 0">
            {{ purchaseDate?.format('MMM YYYY') }}
          </InventoryTableItem>
          <InventoryTableItem :is-archived="totalAmount <= 0">
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
