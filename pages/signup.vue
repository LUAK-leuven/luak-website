<script setup lang="ts">
import type { Database } from "~/types/database.types";
const supabase = useSupabaseClient<Database>();

const formSchema = yup.object({
  firstName: yup.string().required().label("First name"),
  lastName: yup.string().required().label("Last name"),
  email: yup.string().required().email(),
  password: yup.string().password().required(),
  newsletter: yup.bool().default(true),
  whatsapp: yup.bool().default(true),
  phoneNumber: yup.string().phone(),
});
const { handleSubmit, isSubmitting, setFieldError } = useForm({
  validationSchema: toTypedSchema(formSchema),
});

const onSubmit = handleSubmit(async (submitted) => {
  console.log(submitted);
  const { error } = await supabase.auth.signUp({
    email: submitted.email,
    password: submitted.password,
    phone: submitted.phoneNumber,
    options: {
      data: {
        firstName: submitted.firstName,
        lastName: submitted.lastName,
      },
    },
  });
  if (error) {
    setFieldError("password", error.message);
  } else {
    const { error } = await supabase.from("Users").insert({
      first_name: submitted.firstName,
      last_name: submitted.lastName,
      has_newsletter: submitted.newsletter,
      has_whatsapp: submitted.whatsapp,
      phone_number: submitted.phoneNumber,
    });
    if (error) {
      setFieldError("password", error.message);
    } else await navigateTo("/confirmLogin");
  }
});
</script>
<template>
  <div class="relative flex flex-wrap justify-center z-2 bg-base-300">
    <div
      class="bg-base-100 shadow-md rounded w-10/12 lg:w-8/12 xl:w-1/3 mb-28 z-10 mt-8 p-20"
    >
      <form @submit="onSubmit">
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
        <InputBool label="Can we contact you via whatsapp?" name="whatsapp" />
        <InputBool label="Subscribe to monthly newsletter?" name="newsletter" />

        <div class="flex justify-center">
          <button class="btn btn-primary w-full p-5">
            <span v-if="isSubmitting" class="loading loading-spinner"
              >loading</span
            >
            <span v-else>Sign up</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
