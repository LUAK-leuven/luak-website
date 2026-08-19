<script lang="ts" setup>
  import * as yup from 'yup';
  import { yup_password } from '~/utils/yup';
  import TextField from '~/components/input/TextField.vue';
  import Button from '~/components/shared/Button.vue';

  const user = useSupabaseUser();
  const supabase = useSupabaseClient();
  const { show: showToast } = useToast();

  const isChangedSuccessfull = ref(false);

  const { handleSubmit, isSubmitting } = useForm({
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
      showToast('error', error.message);
    } else {
      isChangedSuccessfull.value = true;
      showToast('success', 'Password changed successfully.');
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
      autocomplete="new-password"
      data-testid="new-password" />
    <TextField
      label="Confirm password"
      name="password2"
      placeholder="*******"
      type="password"
      autocomplete="new-password"
      data-testid="confirm-password" />
    <div class="flex justify-end">
      <Button
        class="btn btn-primary mt-2"
        :class="{ 'btn-disabled': isChangedSuccessfull }"
        data-testid="change-password-button">
        <span v-if="isSubmitting" class="loading loading-spinner">loading</span>
        <span
          v-else-if="isChangedSuccessfull"
          class="material-symbols-outlined">
          check
        </span>
        <span v-else>Change Password</span>
      </Button>
    </div>
  </form>
</template>
