<script lang="ts" setup>
import type { Database } from "~/types/database.types";
import { yup_phone } from "~/utils/yup";
import * as yup from "yup";

const supabase = useSupabaseClient<Database>();
const user = useSupabaseUser();

const { data: userData } = await useAsyncData("userData", async () => {
  if (!user.value) throw createError({ statusCode: 401 });
  const { data } = await supabase
    .from("Users")
    .select("*")
    .eq("id", user.value.id)
    .single();
  return data;
});
const initialValues = {
  firstName: userData.value?.first_name,
  lastName: userData.value?.last_name,
  newsletter: userData.value?.has_newsletter,
  whatsapp: userData.value?.has_whatsapp,
  phoneNumber: userData.value?.phone_number ?? undefined,
};

const formSchema = yup.object({
  firstName: yup.string().label("First name"),
  lastName: yup.string().label("Last name"),
  newsletter: yup.bool(),
  whatsapp: yup.bool(),
  phoneNumber: yup_phone,
});
const isChangedSuccessfull = ref(false);

const { handleSubmit, isSubmitting, setFieldError, meta } = useForm({
  validationSchema: toTypedSchema(formSchema),
  initialValues: initialValues,
});
const onSubmit = handleSubmit(async (submitted) => {
  if (!user.value) throw createError({ statusCode: 401 });
  const { error } = await supabase
    .from("Users")
    .update({
      first_name: submitted.firstName,
      last_name: submitted.lastName,
      has_newsletter: submitted.newsletter,
      has_whatsapp: submitted.whatsapp,
      phone_number: submitted.phoneNumber,
    })
    .eq("id", user.value?.id);
  if (error) {
    setFieldError("newsletter", error.message);
  } else {
    isChangedSuccessfull.value = true;
  }
});
</script>
<template>
  <form @submit="onSubmit">
    <h2>👩 Update Info:</h2>
    <div class="flex flex-row justify-stretch">
      <InputText
        class="mr-1"
        label="First name"
        name="firstName"
        placeholder="Alex"
      />
      <InputText
        class="ml-1"
        label="Last name"
        name="lastName"
        placeholder="Megos"
      />
    </div>
    <InputText
      label="Phone Number (for WhatsApp)"
      name="phoneNumber"
      placeholder="+32468123123"
      type="tel"
    />
    <InputBool name="whatsapp">Can we contact you via whatsapp?</InputBool>
    <InputBool name="newsletter">Subscribe to monthly newsletter?</InputBool>
    <div class="flex justify-end">
      <button
        class="btn btn-primary mt-2"
        :class="{ 'btn-disabled': isChangedSuccessfull || !meta.dirty }"
      >
        <span v-if="isSubmitting" class="loading loading-spinner">loading</span>
        <span
          v-else-if="isChangedSuccessfull"
          class="material-symbols-outlined"
        >
          check
        </span>
        <span v-else>Change Info</span>
      </button>
    </div>
  </form>
</template>
