<script setup lang="ts">
  import * as yup from 'yup';
  import TextField from '~/components/input/TextField.vue';
  import LoadingButton from '~/components/shared/LoadingButton.vue';

  definePageMeta({
    middleware: 'unauthenticated',
  });

  const supabase = useSupabaseClient();
  const redirect = useRoute().query['redirect'] as string;

  const formSchema = yup.object({
    email: yup.string().required().email(),
    password: yup.string().required(),
  });
  const { handleSubmit, setFieldError } = useForm({
    validationSchema: toTypedSchema(formSchema),
  });

  const onSubmit = handleSubmit(async (submitted) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: submitted.email,
      password: submitted.password,
    });
    if (error) {
      setFieldError('password', error.message);
    } else {
      const path = redirect ?? '/profile/overview';
      return navigateTo(path);
    }
  });
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
          <NuxtLink class="underline my-2" to="/forgot-password">
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
      <NuxtLink to="/signup">
        <button class="btn btn-outline btn-primary w-full p-5">
          Create an account
        </button>
      </NuxtLink>
    </div>
  </div>
</template>
