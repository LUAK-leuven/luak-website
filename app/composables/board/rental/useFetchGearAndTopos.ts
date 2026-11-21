import { toRentalItem } from '~/composables/board/rental/rentalFormItems';

export const useFetchGearAndTopos = () => {
  const { data: allGear_, pending: gearPending } = useLazyFetch(
    '/api/gear/inventory',
    { method: 'get' },
  );
  const { data: allTopos_, pending: toposPending } = useLazyFetch(
    '/api/topos',
    { method: 'get' },
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
