<script setup lang="ts">
  import type { GearItemId } from '~/types/gear';
  import RetirementDate from '../retirementDate.vue';
  import dayjs from 'dayjs';

  definePageMeta({ middleware: 'board-member-guard' });
  const gearItemName = useRoute().params.name as GearItemId;

  const { data, pending } = await gearService().getGearItemByName(gearItemName);

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
  <FullPageCard>
    <template #title>Gear Details</template>
    <template #subtitle>
      <h2 class="mt-0">
        {{ gearItemName }}
      </h2>
    </template>

    <div v-if="pending" class="flex justify-center items-center py-10">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <div v-else-if="!data">ERROR!</div>

    <template v-else>
      <div class="flex flex-row flex-wrap justify-between gap-3 mt-3">
        <span>
          Available: {{ data.availableAmount }} /
          {{ data.totalAmount }}
        </span>
        <span>Lifespan: {{ data.lifespan }} years</span>
        <span>Deposit fee: {{ (data.depositFee / 100).toFixed(2) }} €</span>
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
          } of data.inventory"
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
                getRetirementDate(purchaseDate, productionDate, data.lifespan)
              " />
          </div>
        </template>
      </div>

      <template v-if="data.rentals.length > 0">
        <hr class="my-3" />
        <b>Rentals</b>
        <div
          class="grid grid-cols-[3fr_1fr] border rounded-sm overflow-x-scroll">
          <b class="border px-1">Name</b>
          <b class="border px-1">Amount</b>
          <template
            v-for="{ id, memberName, amount } of data.rentals"
            :key="id">
            <NuxtLink class="border p-1" :to="`/board/rentals/${id}`">
              {{ memberName }}
              <span class="material-symbols-outlined text-lg">
                open_in_new
              </span>
            </NuxtLink>
            <div class="border p-1">{{ amount }}</div>
          </template>
        </div>
      </template>
    </template>

    <hr />
    <div class="flex flex-row justify-center mt-1">
      <i>{{ data?.id }}</i>
    </div>
  </FullPageCard>
</template>
