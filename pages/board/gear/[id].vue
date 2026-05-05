<script setup lang="ts">
  import type { GearItemId } from '~/types/gear';
  import dayjs from 'dayjs';
  import { useBreakpoints, breakpointsTailwind } from '@vueuse/core';
  import InventoryTableItem from '~/components/board/gear/inventoryTableItem.vue';
  import RetirementDate from '~/components/board/gear/retirementDate.vue';

  const gearItemId = useRoute().params.id as GearItemId;

  const {
    data: data_,
    pending,
    error,
  } = await gearService().getGearItemDetails(gearItemId);
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
              const startDate =
                purchaseDate !== undefined
                  ? purchaseDate
                  : productionDate !== undefined
                    ? productionDate.add(1, 'year')
                    : undefined;
              return {
                ...x,
                productionDate,
                purchaseDate,
                retirementDate: startDate?.add(data_.value!.lifespan, 'y'),
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
  const sm = computed(() => bp.sm.value);
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
      <span>
        Available: {{ gearItems.availableAmount }} /
        {{ gearItems.totalAmount }}
      </span>
      <span>Lifespan: {{ gearItems.lifespan }} years</span>
      <span>Deposit fee: {{ (gearItems.depositFee / 100).toFixed(2) }} €</span>
    </div>

    <hr class="my-3" />
    <b>Inventory</b>
    <ClientOnly>
      <div
        class="grid grid-cols-[3fr_1fr_2fr] sm:grid-cols-[3fr_1fr_1fr_2fr] lg:grid-cols-[4fr_1fr_1fr_2fr_2fr_2fr] border rounded-sm overflow-x-scroll">
        <b class="border px-1">Details</b>
        <b class="border px-1">Amount</b>
        <b v-if="sm" class="border px-1">Status</b>
        <b v-if="lg" class="border px-1">Production date</b>
        <b v-if="lg" class="border px-1">Purchase date</b>
        <b class="border px-1">Retirement date</b>
        <template
          v-for="{
            id,
            details,
            amount,
            status,
            productionDate,
            purchaseDate,
            retirementDate,
          } of gearItems.inventory"
          :key="id">
          <InventoryTableItem :status="status">
            {{ details }}
          </InventoryTableItem>
          <InventoryTableItem :status="status">
            {{ amount }}
          </InventoryTableItem>
          <InventoryTableItem v-if="sm" :status="status">
            {{ status }}
          </InventoryTableItem>
          <InventoryTableItem v-if="lg" :status="status">
            {{ productionDate?.format('MMM YYYY') }}
          </InventoryTableItem>
          <InventoryTableItem v-if="lg" :status="status">
            {{ purchaseDate?.format('MMM YYYY') }}
          </InventoryTableItem>
          <InventoryTableItem :status="status">
            <RetirementDate :retirement-date="retirementDate" />
          </InventoryTableItem>
        </template>
      </div>
    </ClientOnly>

    <template v-if="gearItems.rentals.length > 0">
      <hr class="my-3" />
      <b>Rentals</b>
      <div class="grid grid-cols-[3fr_1fr] border rounded-sm overflow-x-scroll">
        <b class="border px-1">Name</b>
        <b class="border px-1">Amount</b>
        <template
          v-for="{ id, memberName, amount } of gearItems.rentals"
          :key="id">
          <SharedLinkTo
            class="border p-1"
            :text="memberName"
            :to="{ name: 'board-rentals-id', params: { id } }" />
          <div class="border p-1">{{ amount }}</div>
        </template>
      </div>
    </template>
  </PagesDetailsPage>
</template>
