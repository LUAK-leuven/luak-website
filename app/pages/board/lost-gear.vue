<script setup lang="ts">
  import { object as zodObject } from 'zod';

  import { rentalIdSchema } from '#shared/api/rest/rental';
  import {
    rentalItemIdSchema,
    RentalItemType,
    rentalItemTypeSchema,
  } from '#shared/api/rest/rental/rentalItem';
  import GearItem from '~/components/board/lost-gear/GearItem.vue';
  import TopoItem from '~/components/board/lost-gear/TopoItem.vue';
  import PaymentBadge from '~/components/board/rental/PaymentBadge.vue';
  import FullPageCard from '~/components/FullPageCard.vue';
  import WithLazyResource from '~/components/pages/WithLazyResource.vue';
  import BackButton from '~/components/shared/BackButton.vue';

  const route = useRoute('board-lost-gear');
  const rentalId = computed(() =>
    rentalIdSchema.parse(route.query['rentalId']),
  );

  const querySchema = zodObject({
    itemType: rentalItemTypeSchema,
    itemId: rentalItemIdSchema,
  });
  const queryParams = computed(() => {
    const result = querySchema.safeParse(route.query);
    if (!result.success) {
      console.error('Invalid query parameters', result.error);
      throw createError({
        statusCode: 400,
        statusMessage: `Invalid query parameters: ${JSON.stringify(route.query)}`,
      });
    }
    return result.data;
  });

  const { get } = useRentalService();
  const { rental: data, status, error } = await get(rentalId.value);
</script>

<template>
  <FullPageCard>
    <template #title> Lost Gear </template>

    <h2 class="mt-0 text-center">Rental</h2>
    <BackButton
      class="absolute top-10 left-10"
      :to="{
        name: 'board-rentals-id',
        params: { id: rentalId },
      }" />

    <WithLazyResource
      v-slot="{ data: rental }"
      :data="data"
      :is-loading="status === 'pending'"
      :error="error && `Failed to load rental with id: ${rentalId}.`">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div data-testId="member">
          Member: {{ rental.contactInfo.fullName }}
        </div>
        <div class="flex flex-row gap-1 items-center">
          <span>Deposit:</span>
          <span data-testId="depositFee">
            {{ rental.depositFee.toFixed(2) }} €
          </span>
          <PaymentBadge
            class="ml-2"
            :payment-method="rental.paymentMethod"
            data-testId="paymentMethod" />
          <span v-if="rental.depositReturned" class="badge badge-success">
            returned
          </span>
        </div>

        <div class="flex flex-row gap-x-1 items-center flex-wrap">
          <span>Date borrow:</span>
          <span data-testId="dateBorrow">{{ rental.dateBorrow }}</span>
        </div>
        <div class="flex flex-row gap-x-1 items-center flex-wrap">
          <span class="w-max flex-shrink-0">Return date:</span>
          <span class="flex-[44] flex-shrink">
            <BoardRentalReturnDate
              :date="rental.dateReturn"
              :ghost="rental.status === 'returned'"
              data-testId="dateReturn" />
          </span>
        </div>
      </div>

      <hr class="my-2" />

      <TopoItem
        v-if="queryParams.itemType === RentalItemType.topo"
        :rental-id="rentalId"
        :topo="rental.getTopo(queryParams.itemId)" />
      <GearItem
        v-else-if="queryParams.itemType === RentalItemType.gear"
        :rental-id="rental.id"
        :gear-item="rental.getGearItem(queryParams.itemId)" />
      <div v-else>KAPOT!</div>
    </WithLazyResource>
  </FullPageCard>
</template>
