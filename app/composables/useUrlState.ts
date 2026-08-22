export const useUrlState = <T extends QueryParam>(
  key: string,
  parse: (x: QueryParam) => T = (x) => x as T,
) => {
  const router = useRouter();
  const route = useRoute();

  const data = computed({
    get: () => parse(route.query[key]),
    set: (value: T) => {
      void router.replace({
        name: route.name,
        query: { ...route.query, [key]: value },
      });
    },
  });

  return data;
};
