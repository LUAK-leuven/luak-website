export const useFetchGearAndTopos = () => {
  const { data: allGear, pending: gearPending } = useLazyFetch(
    '/api/gear/inventory',
    { method: 'get' },
  );
  const { data: allTopos_, pending: toposPending } = useLazyFetch(
    '/api/topos',
    { method: 'get' },
  );

  const allTopos = computed(() =>
    allTopos_.value?.map((topo) => {
      const name =
        topo.yearPublished === null
          ? topo.title
          : `${topo.title} (${topo.yearPublished.toFixed()})`;
      return {
        id: topo.id,
        name,
        totalAmount: topo.totalAmount,
        availableAmount: topo.availableAmount,
        depositFee: 500,
      };
    }),
  );

  return {
    allGear,
    allTopos,
    pending: computed(() => gearPending.value || toposPending.value),
  };
};
