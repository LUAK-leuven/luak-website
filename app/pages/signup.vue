<script setup lang="ts">
  import {
    object as yupObject,
    string as yupString,
    bool as yupBool,
    ref as yupRef,
  } from 'yup';
  import { yup_password, yup_phone } from '~/utils/yup';
  import TextField from '~/components/input/TextField.vue';
  import LoadingButton from '~/components/shared/LoadingButton.vue';
  import BoolField from '~/components/input/BoolField.vue';

  definePageMeta({
    middleware: 'unauthenticated',
  });

  const supabase = useSupabaseClient();

  const { show: showToast } = useToast();

  const url = useRequestURL();

  const formSchema = yupObject({
    firstName: yupString().required().label('First name'),
    lastName: yupString().required().label('Last name'),
    email: yupString().required().email(),
    password: yup_password.required(),
    password2: yupString()
      .required()
      .oneOf([yupRef('password')], 'Passwords must match')
      .label('Confirm password'),
    newsletter: yupBool().default(true),
    whatsapp: yupBool().default(true),
    phoneNumber: yup_phone.transform((v: string) => (v ? v : undefined)),
  });
  const { handleSubmit } = useForm({
    validationSchema: toTypedSchema(formSchema),
  });

  const onSubmit = async () => {
    await handleSubmit(async (submitted) => {
      const { error, data } = await supabase.auth.signUp({
        email: submitted.email,
        password: submitted.password,
        options: {
          emailRedirectTo: `${url.origin}/auth/confirmEmail`,
        },
      });
      if (error) {
        showToast('error', error.message);
        return;
      }
      if (data.session) {
        // Email confirmation disabled
        const { error } = await supabase.from('Users').insert({
          first_name: submitted.firstName,
          last_name: submitted.lastName,
          has_newsletter: submitted.newsletter,
          has_whatsapp: submitted.whatsapp,
          phone_number: submitted.phoneNumber ?? null,
          email: submitted.email,
        });
        if (error) {
          showToast('error', error.message);
          return;
        }
        await navigateTo({ name: 'profile-overview' });
      } else {
        // Email confirmation enabled
        if (data.user === null) {
          showToast('error', 'An unexpected error occurred');
          return;
        }
        const { error } = await supabase.from('Users').insert({
          id: data.user.id,
          first_name: submitted.firstName,
          last_name: submitted.lastName,
          has_newsletter: submitted.newsletter,
          has_whatsapp: submitted.whatsapp,
          phone_number: submitted.phoneNumber ?? null,
          email: submitted.email,
        });
        if (error) {
          showToast('error', 'An unexpected error occurred');
          console.error(error);
          return;
        } else {
          showToast(
            'success',
            `A confirmation email has been sent to ${submitted.email}. Confirm your email address to enable your account.`,
          );
          await navigateTo({ name: 'index' });
        }
      }
    })();
  };
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
            autocomplete="given-name"
            data-testid="firstName" />
          <TextField
            class="ml-1"
            label="Last name *"
            name="lastName"
            placeholder="Megos"
            autocomplete="family-name"
            data-testid="lastName" />
        </div>
        <TextField
          label="Email *"
          name="email"
          placeholder="youremail@example.com"
          type="email"
          autocomplete="email"
          data-testid="email" />
        <TextField
          label="Phone Number (for WhatsApp)"
          name="phoneNumber"
          placeholder="+32468123123"
          type="tel"
          autocomplete="tel"
          data-testid="phone" />
        <TextField
          label="Password *"
          name="password"
          placeholder="*******"
          type="password"
          autocomplete="new-password"
          data-testid="password" />
        <TextField
          label="Confirm password *"
          name="password2"
          placeholder="*******"
          type="password"
          autocomplete="new-password"
          data-testid="confirm-password" />
        <BoolField name="whatsapp">Can we contact you via whatsapp?</BoolField>
        <BoolField name="newsletter">
          Subscribe to monthly newsletter?
        </BoolField>

        <div class="flex justify-center">
          <!-- @ts-expect-error: type generation doesn't work for nullable function types -->
          <LoadingButton
            class="w-full"
            text="Sign up"
            :click-handler="onSubmit"
            data-testid="submitButton" />
        </div>
      </form>
    </div>
  </div>
</template>
