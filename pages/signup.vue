<script setup lang="ts">
  import * as yup from 'yup';
  import { yup_password, yup_phone } from '~/utils/yup';
  import TextField from '~/components/input/TextField.vue';
  import LoadingButton from '~/components/shared/LoadingButton.vue';
  import BoolField from '~/components/input/BoolField.vue';

  definePageMeta({
    middleware: 'unauthenticated',
  });

  const supabase = useSupabaseClient();

  const formSchema = yup.object({
    firstName: yup.string().required().label('First name'),
    lastName: yup.string().required().label('Last name'),
    email: yup.string().required().email(),
    password: yup_password.required(),
    newsletter: yup.bool().default(true),
    whatsapp: yup.bool().default(true),
    phoneNumber: yup_phone.transform((v: string) => (v ? v : undefined)),
  });
  const { handleSubmit, setFieldError } = useForm({
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
      } else await navigateTo({ name: 'confirmLogin' });
    }
  });
</script>

<template>
  <div class="relative flex flex-wrap justify-center z-2 bg-base-300">
    <div
      class="bg-base-100 shadow-md rounded-xl w-10/12 lg:w-8/12 xl:w-1/2 mb-28 z-10 mt-8 p-5 sm:p-20">
      <h2 class="mt-[-1.25rem]">Create an account</h2>
      <form @submit.prevent>
        <div class="flex flex-row justify-stretch">
          <TextField
            class="mr-1"
            label="First name *"
            name="firstName"
            placeholder="Alex"
            autocomplete="given-name" />
          <TextField
            class="ml-1"
            label="Last name *"
            name="lastName"
            placeholder="Megos"
            autocomplete="family-name" />
        </div>
        <TextField
          label="Email *"
          name="email"
          placeholder="youremail@example.com"
          type="email"
          autocomplete="email" />
        <TextField
          label="Phone Number (for WhatsApp)"
          name="phoneNumber"
          placeholder="+32468123123"
          type="tel"
          autocomplete="tel" />
        <TextField
          label="Password *"
          name="password"
          placeholder="*******"
          type="password"
          autocomplete="new-password" />
        <BoolField name="whatsapp">Can we contact you via whatsapp?</BoolField>
        <BoolField name="newsletter">
          Subscribe to monthly newsletter?
        </BoolField>

        <div class="flex justify-center">
          <LoadingButton
            class="w-full"
            text="Sign up"
            :click-handler="onSubmit" />
        </div>
      </form>
    </div>
  </div>
</template>
