<script lang="ts" setup>
  import * as yup from 'yup';
  import { yup_password } from '~/utils/yup';
  import TextField from '~/components/input/TextField.vue';

  const user = useSupabaseUser();
  const supabase = useSupabaseClient();
  const isChangedSuccessfull = ref(false);
  const { handleSubmit, setFieldError, isSubmitting } = useForm({
    validationSchema: toTypedSchema(
      yup.object({
        password: yup_password.required(),
        password2: yup_password
          .required()
          .oneOf([yup.ref('password')], 'Password does not match')
          .label('password'),
        email: yup.string(),
      }),
    ),
    initialValues: { email: user.value?.email },
  });
  const onSubmit = handleSubmit(async (submitted) => {
    const { error } = await supabase.auth.updateUser({
      password: submitted.password,
    });
    if (error) {
      setFieldError('password', error.message);
    } else {
      isChangedSuccessfull.value = true;
    }
  });
</script>
<template>
  <form @submit="onSubmit">
    <h2>🔐 Change Password:</h2>
    <!-- Add a hidden email for accessibility, this way autocomplete knows for which accout the pwd is -->
    <TextField class="hidden" name="email" autocomplete="email" disabled />
    <TextField
      label="New password"
      name="password"
      placeholder="*******"
      type="password"
      autocomplete="new-password" />
    <TextField
      label="Confirm password"
      name="password2"
      placeholder="*******"
      type="password"
      autocomplete="new-password" />
    <div class="flex justify-end">
      <button
        class="btn btn-primary mt-2"
        :class="{ 'btn-disabled': isChangedSuccessfull }">
        <span v-if="isSubmitting" class="loading loading-spinner">loading</span>
        <span
          v-else-if="isChangedSuccessfull"
          class="material-symbols-outlined">
          check
        </span>
        <span v-else>Change Password</span>
      </button>
    </div>
  </form>
</template>
