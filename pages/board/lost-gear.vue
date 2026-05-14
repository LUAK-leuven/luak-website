<script setup lang="ts">
  import FullPageCard from '~/components/FullPageCard.vue';
  import type { RentalItemId, RentalId } from '~/types/rental';
  import { useRentalService } from '~/composables/useRentalService';
  import type { GearItemId, TopoId } from '~/types/gear';
  import { string as yupString } from 'yup';
  import WithLazyResource from '~/components/pages/WithLazyResource.vue';
  import PaymentBadge from '~/components/board/rental/PaymentBadge.vue';
  import TopoItem from '~/components/board/lost-gear/TopoItem.vue';
  import GearItem from '~/components/board/lost-gear/GearItem.vue';

  const route = useRoute('board-lost-gear');
  const rentalId = computed(
    () =>
      yupUuid
        .label('rentalId')
        .validateSync(route.query['rentalId']) as RentalId,
  );

  const itemId = computed<RentalItemId | undefined>(() => {
    const itemId = yupUuid
      .label('itemId')
      .validateSync(route.query['itemId'] as string);
    const itemType = yupString<'topo' | 'gear'>()
      .required()
      .oneOf(['topo', 'gear'])
      .label('itemType')
      .validateSync(route.query['itemType']);

    if (itemType === 'topo') {
      return {
        type: 'topo',
        id: itemId as TopoId,
      };
    } else {
      return {
        type: 'gear',
        id: itemId as GearItemId,
      };
    }
  });

  const { get } = useRentalService();
  const { rentals: data, pending, error } = await get(rentalId.value);
</script>

<template>
  <FullPageCard>
    <template #title> Lost Gear </template>

    <h2 class="mt-0 text-center">Rental</h2>
    <WithLazyResource
      v-slot="{ data: rental }"
      :data="data"
      :is-loading="pending"
      :error="error?.message">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div class="flex flex-col" data-testId="member.fullName">
          Member: {{ rental.member.fullName }}
        </div>
        <div class="flex flex-row gap-1 items-center">
          <span>Deposit:</span>
          <span data-testId="depositFee">
            {{ rental.depositFee.toFixed(2) }} €
          </span>
          <PaymentBadge class="ml-2" :payment-method="rental.paymentMethod" />
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

      <TopoItem v-if="itemId?.type === 'topo'" :topo-id="itemId.id" />
      <GearItem v-else-if="itemId?.type === 'gear'" :gear-item-id="itemId.id" />
      <div v-else>KAPOT!</div>
    </WithLazyResource>
  </FullPageCard>
</template>
