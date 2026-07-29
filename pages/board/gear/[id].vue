<script setup lang="ts">
  import type { GearInventoryDetails, GearItemId } from '~/types/gear';
  import dayjs, { type Dayjs } from 'dayjs';
  import { useBreakpoints, breakpointsTailwind } from '@vueuse/core';
  import InventoryTableItem from '~/components/board/gear/inventoryTableItem.vue';
  import RetirementDate from '~/components/board/gear/retirementDate.vue';

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
    <b>Inventory</b>
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
            <ul class="ml-5">
              <li>
                {{ displayPurchaseDate({ purchaseDate, productionDate }) }}
                : Bought
                {{ initialAmount }}
                item(s)
              </li>
              <li
                v-for="(event, idx) of events"
                :key="idx"
                data-testid="lostItem">
                <div class="flex flex-row flex-wrap gap-x-1">
                  {{ dayjs(event.occuredOn).format('DD-MM-YYYY') }}:
                  <SharedLinkTo
                    v-if="event.eventName === 'ItemLostEvent'"
                    :text="`${event.lostAmount} item(s) lost`"
                    :to="{
                      name: 'board-rentals-id',
                      params: { id: event.rentalId },
                    }" />
                  <span v-else-if="event.eventName === 'ItemArchivedEvent'">
                    {{ event.amount }} item(s) archived
                  </span>
                </div>
              </li>
            </ul>
          </InventoryTableItem>
        </div>
      </div>
    </ClientOnly>

    <template v-if="gearItems.rentals.length > 0">
      <hr class="my-3" />
      <b>Rentals</b>
      <div class="grid grid-cols-[3fr_1fr] border rounded-sm overflow-x-scroll">
        <b class="border px-1">Name</b>
        <b class="border px-1">Amount</b>
        <template
          v-for="{ id, memberName, rentedAmount } of gearItems.rentals"
          :key="id">
          <SharedLinkTo
            class="border p-1"
            :text="memberName"
            :to="{ name: 'board-rentals-id', params: { id } }" />
          <div class="border p-1">{{ rentedAmount }}</div>
        </template>
      </div>
    </template>
  </PagesDetailsPage>
</template>
