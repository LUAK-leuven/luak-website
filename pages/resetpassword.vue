<script setup lang="ts">
  import * as yup from 'yup';

  const supabase = useSupabaseClient();
  const url = useRequestURL();

  const formSchema = yup.object({
    email: yup.string().required().email(),
  });
  const { handleSubmit, isSubmitting, setFieldError } = useForm({
    validationSchema: toTypedSchema(formSchema),
  });
  const isSentSuccessfully = ref(false);
  const onSubmit = handleSubmit(async (submitted) => {
    const { error } = await supabase.auth.resetPasswordForEmail(
      submitted.email,
      { redirectTo: `${url.origin}/passwordReset` },
    );
    if (error) {
      setFieldError('email', error.message);
    } else isSentSuccessfully.value = true;
  });
</script>
<template>
  <div class="relative flex flex-wrap justify-center z-2 bg-base-300">
    <div
      class="bg-base-100 shadow-md rounded w-10/12 lg:w-8/12 xl:w-1/3 mb-28 z-10 mt-8 p-5 sm:p-20">
      <form @submit="onSubmit">
        <NuxtLink class="btn btn-circle btn-sm btn-outline" to="/login">
          <span class="material-symbols-outlined"> arrow_back</span>
        </NuxtLink>
        <h2>❓ Forgot password:</h2>
        <InputText
          label="Email"
          name="email"
          placeholder="youremail@example.com"
          type="email" />
        <div class="flex justify-end">
          <button
            class="btn btn-primary mt-2"
            :class="{ 'btn-disabled': isSentSuccessfully }">
            <span v-if="isSubmitting" class="loading loading-spinner"
              >loading</span
            >
            <span
              v-else-if="isSentSuccessfully"
              class="material-symbols-outlined">
              check
            </span>
            <span v-else>Sent reset link</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
