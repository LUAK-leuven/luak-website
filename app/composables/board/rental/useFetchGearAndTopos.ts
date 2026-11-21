import { toRentalItem } from '~/composables/board/rental/rentalFormItems';

export const useFetchGearAndTopos = () => {
  const { data: allGear_, pending: gearPending } = useLazyFetch(
    '/api/inventory',
    { method: 'get', query: { itemType: 'gear' } },
  );
  const { data: allTopos_, pending: toposPending } = useLazyFetch(
    '/api/inventory',
    { method: 'get', query: { itemType: 'topo' } },
  );

  const allGear = computed(() =>
    allGear_.value?.map((gear) => toRentalItem(gear)),
  );
  const allTopos = computed(() =>
    allTopos_.value?.map((topo) => toRentalItem(topo)),
  );

  return {
    allGear,
    allTopos,
    pending: computed(() => gearPending.value || toposPending.value),
  };
};
