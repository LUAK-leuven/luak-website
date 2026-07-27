<script setup lang="ts">
  import createMembershipSchema from '~/components/user/BuyMembership/createMembershipSchema';
  import BoolField from '~/components/input/BoolField.vue';
  import Button from '~/components/shared/Button.vue';

  const { handleSubmit, isSubmitting } = useForm({
    validationSchema: toTypedSchema(createMembershipSchema),
    initialValues: { sportscard: false },
  });
  const luak_year = getLuakYear();
  const user = useSupabaseUser();
  const env = useRuntimeConfig().public;

  const userService = useUserService();

  const membershipInfo = await userService.getMembershipInfo({
    authRequired: true,
  });

  const buyMembership = handleSubmit(async (submitted) => {
    const membershipId = await userService.saveMembership({
      luakYear: luak_year,
      kbfUiaaMember: submitted.kbf_uiaa_member,
      sportscard: submitted.sportscard,
      student: submitted.student,
    });

    const payment_base_url =
      price.value === 15
        ? env.paymentLinkMembershipDiscount
        : env.paymentLinkMembership;

    const email = user.value?.email?.replace('@', '%40');
    const payment_url = `${payment_base_url}?client_reference_id=${membershipId}&prefilled_email=${email}`;

    return navigateTo(payment_url, { external: true });
  });
  const values = useFormValues();
  const price = computed(() => {
    if (
      values.value.kbf_uiaa_member === 'kbf_luak' ||
      membershipInfo.value.isFirstTimeMember()
    )
      return 15;
    else return 20;
  });
</script>

<template>
  <Button
    class="btn"
    onclick="buy_membership_modal.showModal()"
    data-testId="buyMembershipButton">
    Buy a membership
  </Button>

  <!-- --------------------------------------------- -->

  <dialog id="buy_membership_modal" class="modal modal-bottom md:modal-middle">
    <div class="modal-box bg-base-100 text-black">
      <form method="dialog">
        <Button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
          ✕
        </Button>
      </form>
      <h2 class="mb-4">
        Buy a membership for {{ luak_year }}-{{ luak_year! + 1 }} <br />
      </h2>
      <InputKbfSelect />
      <InputStudentSelect />
      <BoolField name="sportscard" data-testid="sportscard">
        Do you have a sportscard?
      </BoolField>
      <BoolField name="houserules" data-testid="houserules">
        Do you agree to the
        <NuxtLink
          class="text-primary underline"
          :to="{
            name: 'info-slug',
            params: { slug: ['rules_and_regulations'] },
          }">
          house rules
        </NuxtLink>
        ?
        <span class="italic text-error">(required)</span>
      </BoolField>

      <div class="flex w-full justify-end">
        <div v-if="membershipInfo.isFirstTimeMember()" class="stat w-fit">
          <div class="stat-title">First time member discount</div>
          <div class="stat-value text-primary flex gap-2 justify-self-end">
            <div class="line-through text-red-500 text-2xl self-end">20 €</div>
            <div data-testid="price">{{ price }} €</div>
          </div>
        </div>
        <div v-else class="stat w-fit">
          <div class="stat-title">Total price</div>
          <div class="stat-value text-primary" data-testid="price">
            {{ price }} €
          </div>
        </div>
      </div>

      <div class="modal-action">
        <form method="dialog">
          <Button class="btn">Close</Button>
        </form>
        <Button
          class="btn btn-primary"
          data-testid="buy-membership-button"
          @click="buyMembership">
          <span v-if="isSubmitting" class="loading loading-spinner">
            loading
          </span>
          <span v-else>buy membership</span>
        </Button>
      </div>
    </div>
  </dialog>
</template>
