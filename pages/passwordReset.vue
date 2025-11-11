<script setup lang="ts">
  import * as yup from 'yup';

  const supabase = useSupabaseClient();
  const route = useRoute();

  const dialog = ref<HTMLDialogElement>();
  const authError = ref<{ error: string; description: string }>();
  const success = ref(false);

  const formSchema = yup.object({
    pwd1: yup_password.required().label('password'),
    pwd2: yup_password
      .required()
      .oneOf([yup.ref('pwd1')], 'Password does not match')
      .label('password'),
  });

  const { handleSubmit } = useForm({
    validationSchema: toTypedSchema(formSchema, { abortEarly: false }),
    initialValues: { pwd1: '', pwd2: '' },
  });

  const onSubmit = handleSubmit(async (submitted) => {
    const { data, error } = await supabase.auth.updateUser({
      password: submitted.pwd1,
    });
    if (data.user) {
      success.value = true;
      await new Promise((resolve) => setTimeout(resolve, 800));
      await navigateTo({
        path: '/profile/overview',
      });
    }
    if (error) {
      authError.value = {
        error: `There was an error updating your password!`,
        description: error.message,
      };
    }
  });

  effect(() => {
    if (authError.value) {
      if (dialog.value === undefined) alert(authError.value.error);
      else dialog.value.showModal();
    }
  });

  onMounted(async () => {
    dialog.value = document.getElementById('auth-error') as HTMLDialogElement;

    console.log('query:', route.query);
    if (route.query.error) {
      authError.value = {
        error: route.query.error as string,
        description: route.query.error_description as string,
      };
    }
    if (!route.query.code) {
      authError.value = {
        error: 'Redirect link is invalid',
        description: '',
      };
    }
  });
</script>

<template>
  <div class="relative flex justify-center bg-base-300">
    <div
      class="bg-base-100 shadow-md rounded-lg w-10/12 lg:w-8/12 xl:w-1/3 max-w-[400px] mb-28 z-10 mt-8 p-10">
      <form @submit="onSubmit">
        <InputText
          label="Enter your new password:"
          name="pwd1"
          placeholder="******"
          type="password"></InputText>
        <InputText
          label="Confirm your password:"
          name="pwd2"
          placeholder="******"
          type="password"></InputText>
        <div class="flex justify-end">
          <button class="btn btn-primary">Submit</button>
        </div>
      </form>
    </div>

    <dialog id="auth-error" class="modal">
      <div class="modal-box">
        <h2>Error: {{ authError?.error }}</h2>
        <p>{{ authError?.description }}</p>
        <div class="flex flex-row justify-end">
          <NuxtLink class="btn btn-primary" to="./">OK</NuxtLink>
        </div>
      </div>
    </dialog>

    <pop-up :show="success">Password updated successfully</pop-up>
  </div>
</template>
