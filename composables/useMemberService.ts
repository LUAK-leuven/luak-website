export async function useMemberService() {
  const user = useSupabaseUser();

  const { data: paidMemberships, error } = await useAsyncData(
    'membershipInfo',
    async () => {
      if (user.value === null) return null;
      const { data, error } = await useSupabaseClient()
        .from('Users')
        .select('first_name, last_name, Memberships(year, Payments(approved))')
        .eq('id', user.value.sub)
        .eq('Memberships.Payments.approved', true)
        .single();
      if (error) {
        console.warn('error', error);
        throw error;
      }
      return data.Memberships.filter(({ Payments }) =>
        Payments.some(({ approved }) => approved),
      ).map(({ year }) => year);
    },
    { watch: [user], lazy: false },
  );
  if (error.value) console.warn('membershipInfo', error.value);

  const wasMemberLastYear = computed(() => {
    if (paidMemberships.value === null) return false;
    const currentYear = getLuakYear();
    return (
      !paidMemberships.value.includes(currentYear) &&
      paidMemberships.value.includes(currentYear - 1)
    );
  });

  const isFirstTimeMember = computed(() => {
    if (paidMemberships.value === null) return false;
    return paidMemberships.value.length === 0;
  });

  return { paidMemberships, wasMemberLastYear, isFirstTimeMember };
}
