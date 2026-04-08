<script setup lang="ts">
  import * as yup from 'yup';
  import TextField from '~/components/input/TextField.vue';
  import LoadingButton from '~/components/shared/LoadingButton.vue';
  import { useToast } from '~/composables/useToast';

  definePageMeta({ middleware: 'unauthenticated' });

  const supabase = useSupabaseClient();
  const route = useRoute();
  const user = useSupabaseUser();
  const { show: showPopup } = useToast();

  const dialog = ref<HTMLDialogElement>();
  const authError = ref<{ error: string; description: string }>();

  const formSchema = yup.object({
    pwd1: yup_password.required().label('password'),
    pwd2: yup_password
      .required()
      .oneOf([yup.ref('pwd1')], 'Password does not match')
      .label('password'),
    email: yup.string(),
  });

  const { handleSubmit, setValues } = useForm({
    validationSchema: toTypedSchema(formSchema, { abortEarly: false }),
    initialValues: { pwd1: '', pwd2: '' },
  });

  const onSubmit = handleSubmit(async (submitted) => {
    const { data, error } = await supabase.auth.updateUser({
      password: submitted.pwd1,
    });
    if (data.user) {
      showPopup('success', 'Password updated successfully.');
      return navigateTo({
        path: '/profile/overview',
      });
    }
    if (error) {
      showPopup('error', `There was an error updating your password!`);
      console.error(error.message);
    }
  });

  watch(authError, (value) => {
    if (value) {
      if (dialog.value === undefined) alert(value.error);
      else dialog.value.showModal();
    }
  });

  onMounted(async () => {
    dialog.value = document.getElementById('auth-error') as HTMLDialogElement;

    if (route.query.error) {
      authError.value = {
        error: route.query.error as string,
        description: route.query.error_description as string,
      };
    } else if (!route.query.code) {
      authError.value = {
        error: 'Redirect link is invalid',
        description: '',
      };
    } else {
      setValues({ email: user.value?.email });
    }
  });
</script>

<template>
  <div class="relative flex justify-center bg-base-300">
    <div
      class="bg-base-100 shadow-md rounded-lg w-10/12 lg:w-8/12 xl:w-1/3 max-w-[400px] mb-28 z-10 mt-8 p-10">
      <form @submit.prevent>
        <h2>Reset password for {{ user?.email ?? '' }}</h2>
        <TextField class="hidden" name="email" autocomplete="email" />
        <TextField
          label="Enter your new password:"
          name="pwd1"
          placeholder="******"
          type="password"
          autocomplete="new-password" />
        <TextField
          label="Confirm your password:"
          name="pwd2"
          placeholder="******"
          type="password"
          autocomplete="new-password" />
        <div class="flex justify-end">
          <LoadingButton text="Submit" :click-handler="onSubmit" />
        </div>
      </form>
    </div>

    <dialog id="auth-error" class="modal">
      <div class="modal-box">
        <h2>Error: {{ authError?.error }}</h2>
        <p>{{ authError?.description }}</p>
        <div class="flex flex-row justify-end">
          <NuxtLink class="btn btn-primary" to="/">OK</NuxtLink>
        </div>
      </div>
    </dialog>
  </div>
</template>
