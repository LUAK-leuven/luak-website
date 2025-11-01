<script setup lang="ts">
  import * as yup from 'yup';
  import { yup_password } from '~/utils/yup';

  const supabase = useSupabaseClient();
  const formSchema = yup.object({
    email: yup.string().required().email(),
    password: yup_password.required(),
  });
  const { handleSubmit, isSubmitting, setFieldError } = useForm({
    validationSchema: toTypedSchema(formSchema),
  });

  const onSubmit = handleSubmit(async (submitted) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: submitted.email,
      password: submitted.password,
    });
    if (error) {
      setFieldError('password', error.message);
    } else await navigateTo('/confirmLogin');
  });
</script>
<template>
  <div class="relative flex flex-wrap justify-center z-2 bg-base-300">
    <div
      class="bg-base-100 shadow-md rounded w-10/12 lg:w-8/12 xl:w-1/3 mb-28 z-10 mt-8 p-5 sm:p-20">
      <form @submit="onSubmit">
        <InputText
          label="Email"
          name="email"
          placeholder="youremail@example.com"
          type="email" />
        <InputText
          label="Password"
          name="password"
          placeholder="*******"
          type="password" />
        <div class="flex flex-row justify-end">
          <NuxtLink class="underline my-2" to="/resetpassword"
            >Forgot password?</NuxtLink
          >
        </div>
        <div>
          <button class="btn btn-primary w-full p-5">
            <span v-if="isSubmitting" class="loading loading-spinner"
              >loading</span
            >
            <span v-else>Sign in</span>
          </button>
        </div>
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
