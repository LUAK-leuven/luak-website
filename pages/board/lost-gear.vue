<script setup lang="ts">
  import FullPageCard from '~/components/FullPageCard.vue';
  import type { RentalItemId, RentalId } from '~/types/rental';
  import { useRentalService } from '~/composables/useRentalService';
  import type { GearItemId, TopoId } from '~/types/gear';
  import { string as yupString } from 'yup';

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
  const { rentals: rental, pending, error } = await get(rentalId.value);
</script>

<template>
  <FullPageCard>
    <template #title> Lost Gear </template>
    ItemId: {{ itemId }}
    <hr />
    Rental: {{ rental }}
  </FullPageCard>
</template>
