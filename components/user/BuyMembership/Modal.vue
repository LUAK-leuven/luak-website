<script setup lang="ts">
import type { Database } from "~/types/database.types";
import createMembershipSchema from "~/yup_schemas/createMembershipSchema";
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
  if (hasMembership.value === "no_membership") {
    const { data, error } = await supabase
      .from("Memberships")
      .insert({
        kbf_uiaa_member: submitted.kbf_uiaa_member,
        sportscard: submitted.sportscard,
        student: submitted.student,
      })
      .select()
      .single();
    if (error || !data) throw error;
    membership = data;
  } else if (hasMembership.value === "unpaid_membership") {
    const { data, error } = await supabase
      .from("Memberships")
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
  } else throw Error("User already has a membership");
  let payment_url;
  if (submitted.kbf_uiaa_member === "kbf_luak")
    payment_url = env.paymentLinkMembershipDiscount;
  else payment_url = env.paymentLinkMembership;

  const email = user.value?.email?.replace("@", "%40");
  payment_url = `${payment_url}?client_reference_id=${membership.id}&prefilled_email=${email}`;

  navigateTo(payment_url, { external: true });
});
const values = useFormValues();
const price = computed(() => {
  if (values.value.kbf_uiaa_member === "kbf_luak") return 15;
  else return 20;
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
        Buy a membership for {{ luak_year }}-{{ luak_year! + 1 }}
      </h2>
      <InputKbfSelect />
      <InputStudentSelect />
      <InputBool name="sportscard">Do you have a sportscard?</InputBool>
      <InputBool name="houserules"
        >Do you agree to the
        <NuxtLink
          class="text-primary underline"
          to="/info/rules_and_regulations"
          >house rules</NuxtLink
        >? <span class="italic text-error">(required)</span></InputBool
      >

      <div class="flex w-full justify-end">
        <div class="stat w-fit">
          <div class="stat-title">Total price</div>
          <div class="stat-value text-primary">{{ price }} €</div>
        </div>
      </div>

      <div class="modal-action">
        <form method="dialog">
          <button class="btn">Close</button>
        </form>
        <button class="btn btn-primary" @click="buyMembership">
          <span v-if="isSubmitting" class="loading loading-spinner"
            >loading</span
          >
          <span v-else>buy membership</span>
        </button>
      </div>
    </div>
  </dialog>
</template>
