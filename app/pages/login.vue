<script setup lang="ts">
  import { string as yupString, object as yupObject } from 'yup';
  import { useWaitForAuthUser } from '~/composables/useWaitForAuthUser';
  import TextField from '~/components/input/TextField.vue';
  import LoadingButton from '~/components/shared/LoadingButton.vue';

  const supabase = useSupabaseClient();
  const redirect = useRoute().query['redirect'] as string | null;

  const formSchema = yupObject({
    email: yupString().required().email(),
    password: yupString().required(),
  });
  const { handleSubmit, setFieldError } = useForm({
    validationSchema: toTypedSchema(formSchema),
  });

  const onSubmit = async () => {
    await handleSubmit(async (submitted) => {
      const { error } = await supabase.auth.signInWithPassword({
        email: submitted.email,
        password: submitted.password,
      });
      if (error) {
        setFieldError('password', error.message);
      } else {
        await useWaitForAuthUser();
        if (redirect) {
          await navigateTo(redirect);
        } else {
          await navigateTo({ name: 'profile-overview' });
        }
      }
    })();
  };
</script>
<template>
  <div class="relative flex flex-wrap justify-center z-2 bg-base-300">
    <div
      class="bg-base-100 shadow-md rounded w-10/12 lg:w-8/12 xl:w-1/3 mb-28 z-10 mt-8 p-5 sm:p-20">
      <form @submit.prevent>
        <TextField
          label="Email"
          name="email"
          placeholder="youremail@example.com"
          type="email"
          autocomplete="email"
          data-testId="login.email" />
        <TextField
          label="Password"
          name="password"
          placeholder="*******"
          type="password"
          autocomplete="current-password"
          data-testId="login.password" />
        <div class="flex flex-row justify-end">
          <NuxtLink class="underline my-2" :to="{ name: 'forgot-password' }">
            Forgot password?
          </NuxtLink>
        </div>
        <LoadingButton
          class="w-full"
          text="Log in"
          :click-handler="onSubmit"
          data-testId="login.submit" />
      </form>
      <div class="divider">OR</div>
      <NuxtLink
        class="btn btn-outline btn-primary w-full p-5"
        :to="{ name: 'signup' }">
        Create an account
      </NuxtLink>
    </div>
  </div>
</template>
