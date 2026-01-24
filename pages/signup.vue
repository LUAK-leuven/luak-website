<script setup lang="ts">
  import * as yup from 'yup';
  import type { Database } from '~/types/database.types';
  import { yup_password, yup_phone } from '~/utils/yup';
  const supabase = useSupabaseClient<Database>();

  const formSchema = yup.object({
    firstName: yup.string().required().label('First name'),
    lastName: yup.string().required().label('Last name'),
    email: yup.string().required().email(),
    password: yup_password.required(),
    newsletter: yup.bool().default(true),
    whatsapp: yup.bool().default(true),
    phoneNumber: yup_phone.transform((v: string) => (v ? v : undefined)),
  });
  const { handleSubmit, isSubmitting, setFieldError } = useForm({
    validationSchema: toTypedSchema(formSchema),
  });

  const onSubmit = handleSubmit(async (submitted) => {
    const { error } = await supabase.auth.signUp({
      email: submitted.email,
      password: submitted.password,
    });
    if (error) {
      setFieldError('password', error.message);
    } else {
      const { error } = await supabase.from('Users').insert({
        first_name: submitted.firstName,
        last_name: submitted.lastName,
        has_newsletter: submitted.newsletter,
        has_whatsapp: submitted.whatsapp,
        phone_number: submitted.phoneNumber,
        email: submitted.email,
      });
      if (error) {
        setFieldError('password', error.message);
      } else await navigateTo('/confirmLogin');
    }
  });
</script>
<template>
  <div class="relative flex flex-wrap justify-center z-2 bg-base-300">
    <div
      class="bg-base-100 shadow-md rounded w-10/12 lg:w-8/12 xl:w-1/2 mb-28 z-10 mt-8 p-5 sm:p-20">
      <form @submit="onSubmit">
        <div class="flex flex-row justify-stretch">
          <InputText
            class="mr-1"
            label="First name *"
            name="firstName"
            placeholder="Alex" />
          <InputText
            class="ml-1"
            label="Last name *"
            name="lastName"
            placeholder="Megos" />
        </div>
        <InputText
          label="Email *"
          name="email"
          placeholder="youremail@example.com"
          type="email" />
        <InputText
          label="Phone Number (for WhatsApp)"
          name="phoneNumber"
          placeholder="+32468123123"
          type="tel" />
        <InputText
          label="Password *"
          name="password"
          placeholder="*******"
          type="password" />
        <InputBool name="whatsapp">Can we contact you via whatsapp?</InputBool>
        <InputBool name="newsletter">
          Subscribe to monthly newsletter?
        </InputBool>

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
