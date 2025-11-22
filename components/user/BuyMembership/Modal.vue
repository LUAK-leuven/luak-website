<script setup lang="ts">
  import type { Database } from '~/types/database.types';
  import createMembershipSchema from '~/yup_schemas/createMembershipSchema';
  const { handleSubmit, isSubmitting } = useForm({
    validationSchema: toTypedSchema(createMembershipSchema),
    initialValues: { sportscard: false },
  });
  const hasMembership = await getHasMembership();
  const luak_year = getLuakYear();
  const supabase = useSupabaseClient<Database>();
  const user = useSupabaseUser();
  const env = useRuntimeConfig().public;

  const buyMembership = handleSubmit(async (submitted) => {
    let membership;
    if (hasMembership.value === 'no_membership') {
      const { data, error } = await supabase
        .from('Memberships')
        .insert({
          kbf_uiaa_member: submitted.kbf_uiaa_member,
          sportscard: submitted.sportscard,
          student: submitted.student,
        })
        .select()
        .single();
      if (error || !data) throw error;
      membership = data;
    } else if (hasMembership.value === 'unpaid_membership') {
      const { data, error } = await supabase
        .from('Memberships')
        .update({
          kbf_uiaa_member: submitted.kbf_uiaa_member,
          sportscard: submitted.sportscard,
          student: submitted.student,
        })
        .match({ user_id: user.value?.id, year: luak_year })
        .select()
        .single();
      if (error || !data) throw error;
      membership = data;
    } else throw Error('User already has a membership');
    let payment_url;
    if (price.value === 15) payment_url = env.paymentLinkMembershipDiscount;
    else payment_url = env.paymentLinkMembership;

    const email = user.value?.email?.replace('@', '%40');
    payment_url = `${payment_url}?client_reference_id=${membership.id}&prefilled_email=${email}`;

    navigateTo(payment_url, { external: true });
  });
  const values = useFormValues();
  const price = computed(() => {
    if (values.value.kbf_uiaa_member === 'kbf_luak' || isFirstTimeMember.value)
      return 15;
    else return 20;
  });

  const isFirstTimeMember = ref(false);
  async function getIsFirstTimeMember(): Promise<boolean> {
    if (user.value?.id) {
      const { data: membershipIds } = await supabase
        .from('Memberships')
        .select('id')
        .eq('user_id', user.value?.id)
        .lte('year', luak_year);
      if (membershipIds === null || membershipIds.length === 0) {
        return true;
      }

      const { data: payments } = await supabase
        .from('Payments')
        .select('*')
        .in(
          'membership_id',
          membershipIds.map((item) => item.id),
        )
        .eq('approved', true);
      console.log(payments);
      if (payments === null || payments.length === 0) {
        return true;
      }

      return false;
    }

    return false;
  }

  onMounted(async () => {
    isFirstTimeMember.value = await getIsFirstTimeMember();
  });
</script>

<template>
  <button class="btn" onclick="buy_membership_modal.showModal()">
    Buy a membership
  </button>

  <!-- --------------------------------------------- -->

  <dialog id="buy_membership_modal" class="modal modal-bottom md:modal-middle">
    <div class="modal-box bg-base-100 text-black">
      <form method="dialog">
        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
          ✕
        </button>
      </form>
      <h2 class="mb-4">
        Buy a membership for {{ luak_year }}-{{ luak_year! + 1 }} <br />
      </h2>
      <InputKbfSelect />
      <InputStudentSelect />
      <InputBool name="sportscard">Do you have a sportscard?</InputBool>
      <InputBool name="houserules">
        Do you agree to the
        <NuxtLink
          class="text-primary underline"
          to="/info/rules_and_regulations">
          house rules
        </NuxtLink>
        ?
        <span class="italic text-error">(required)</span>
      </InputBool>

      <div class="flex w-full justify-end">
        <div v-if="isFirstTimeMember" class="stat w-fit">
          <div class="stat-title">First time member discount</div>
          <div class="stat-value text-primary flex gap-2 justify-self-end">
            <div class="line-through text-red-500 text-2xl self-end">20 €</div>
            <div>{{ price }} €</div>
          </div>
        </div>
        <div v-else class="stat w-fit">
          <div class="stat-title">Total price</div>
          <div class="stat-value text-primary">{{ price }} €</div>
        </div>
      </div>

      <div class="modal-action">
        <form method="dialog">
          <button class="btn">Close</button>
        </form>
        <button class="btn btn-primary" @click="buyMembership">
          <span v-if="isSubmitting" class="loading loading-spinner">
            loading
          </span>
          <span v-else>buy membership</span>
        </button>
      </div>
    </div>
  </dialog>
</template>
