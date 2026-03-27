<script setup lang="ts">
  import type { GearItemId } from '~/types/gear';
  import RetirementDate from '../retirementDate.vue';
  import dayjs from 'dayjs';

  definePageMeta({ middleware: 'board-member-guard' });
  const gearItemId = useRoute().params.id as GearItemId;

  const { data, pending, error } = await gearService().getGearItem(gearItemId);

  const getRetirementDate = (
    purchaseDate: string | undefined,
    productionDate: string | undefined,
    lifespan: number,
  ) => {
    const startDate =
      purchaseDate !== undefined
        ? dayjs(purchaseDate)
        : productionDate !== undefined
          ? dayjs(productionDate).add(1, 'year')
          : undefined;

    return startDate?.add(lifespan, 'years');
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
    back-to="/board/gear">
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
    <div
      class="grid grid-cols-[3fr_1fr_1fr_2fr] border rounded-sm overflow-x-scroll">
      <b class="border px-1">Details</b>
      <b class="border px-1">Amount</b>
      <b class="border px-1">Status</b>
      <b class="border px-1">Retirement date</b>
      <template
        v-for="{
          id,
          details,
          amount,
          status,
          productionDate,
          purchaseDate,
        } of gearItems.inventory"
        :key="id">
        <div class="border p-1">
          {{ details }}
        </div>
        <div class="border p-1">
          {{ amount }}
        </div>
        <div class="border p-1">
          {{ status }}
        </div>
        <div class="border p-1">
          <RetirementDate
            :retirement-date="
              getRetirementDate(
                purchaseDate,
                productionDate,
                gearItems.lifespan,
              )
            " />
        </div>
      </template>
    </div>

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
            :to="`/board/rentals/${id}`" />
          <div class="border p-1">{{ amount }}</div>
        </template>
      </div>
    </template>
  </PagesDetailsPage>
</template>
