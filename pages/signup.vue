<script setup lang="ts">
import * as yup from "yup";
import type { SubmissionContext } from "vee-validate";
import { Form as VeeForm } from "vee-validate";

const supabase = useSupabaseClient();
const phoneRegExp = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;

const formSchema = yup.object({
  firstName: yup.string().required().label("First name"),
  lastName: yup.string().required().label("Last name"),
  email: yup.string().required().email(),
  password: yup.string().required().min(6),
  phoneNumber: yup
    .string()
    .matches(phoneRegExp, "Format of the phone number is incorrect."),
});
interface formValues extends yup.InferType<typeof formSchema> {}

async function onSubmit(
  { email, password, firstName, lastName, phoneNumber }: formValues,
  actions: SubmissionContext,
) {
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        firstName,
        lastName,
        phoneNumber,
      },
    },
  });
  if (error) {
    actions.setFieldError("password", error.message);
  }
}
</script>
<template>
  <div class="relative flex flex-wrap justify-center z-2 bg-base-300">
    <div
      class="bg-base-100 shadow-md rounded w-10/12 lg:w-8/12 xl:w-1/3 mb-28 z-10 mt-8 p-20"
    >
      <VeeForm
        v-slot="{ isSubmitting, handleSubmit }"
        :validation-schema="formSchema"
        as="div"
      >
        <form @submit="handleSubmit($event, onSubmit)">
          <div class="flex flex-row justify-stretch">
            <InputText
              label="First name"
              name="firstName"
              placeholder="Alex"
              class="mr-1"
            />
            <InputText
              label="Last name"
              name="lastName"
              placeholder="Megos"
              class="ml-1"
            />
          </div>
          <InputText
            label="Email"
            name="email"
            placeholder="youremail@example.com"
            type="email"
          />
          <InputText
            label="Phone Number (for WhatsApp)"
            name="phoneNumber"
            placeholder="+32468123123"
            type="tel"
          />
          <InputText
            label="Password"
            name="password"
            placeholder="*******"
            type="password"
          />
          <div class="flex justify-center">
            <button class="btn btn-primary w-full p-5">
              <span v-if="isSubmitting" class="loading loading-spinner"
                >loading</span
              >
              <span v-else>Sign up</span>
            </button>
          </div>
        </form>
      </VeeForm>
    </div>
  </div>
</template>
