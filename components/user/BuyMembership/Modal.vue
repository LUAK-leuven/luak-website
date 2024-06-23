<script setup lang="ts">
import createMembershipSchema from "~/yup_schemas/createMembershipSchema";
const { handleSubmit, isSubmitting } = useForm({
  validationSchema: toTypedSchema(createMembershipSchema),
});
const buyMembership = handleSubmit(async (submitted) => {
  $fetch();
});
const values = useFormValues();
const price = computed(() => {
  if (values.value.kbf_uiaa_member === "kbf_luak") return 15;
  else return 20;
});
</script>

<template>
  <button class="btn btn-primary" onclick="buy_membership_modal.showModal()">
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
      <h2 class="mb-4">Buy a membership for 2024</h2>
      <InputKbfSelect />
      <InputStudentSelect />
      <InputBool label="Do you have a sportscard?" name="sportscard" />
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
