<script setup lang="ts">
  import * as yup from 'yup';

  const supabase = useSupabaseClient();

  supabase.auth.onAuthStateChange(async (event, session) => {
    void session;
    console.log('auth change: ', event);
    if (event == 'PASSWORD_RECOVERY') {
      console.log('pwd reset event');
      // const newPassword = prompt(
      //   'What would you like your new password to be?',
      // );
      // const { data, error } = await supabase.auth.updateUser({
      //   password: newPassword ?? undefined,
      // });
      // if (data) alert('Password updated successfully!');
      // if (error) alert('There was an error updating your password.');
    }
  });

  const formSchema = yup.object({
    newPassword: yup.string().required().label('New password'),
  });

  const { handleSubmit } = useForm({
    validationSchema: toTypedSchema(formSchema),
    initialValues: { newPassword: '' },
  });

  const onSubmit = handleSubmit(async (submitted) => {
    console.log(`reset pwd to: ${submitted.newPassword}`);
    const { data, error } = await supabase.auth.updateUser({
      password: submitted.newPassword,
    });
    console.log('data: ', data);
    console.log('error: ', error);
    if (data.user) alert('Password updated successfully!');
    if (error) alert('There was an error updating your password.');
  });
</script>
<template>
  <div class="relative flex flex-wrap justify-center bg-base-300">
    <div
      class="bg-base-100 shadow-md rounded-lg w-10/12 lg:w-8/12 xl:w-1/3 mb-28 z-10 mt-8 p-5 sm:p-20">
      <form @submit="onSubmit">
        <InputText
          label="Enter your new password:"
          name="newPassword"
          placeholder="new password"></InputText>
        <div class="flex justify-end">
          <button class="btn btn-primary">Reset</button>
        </div>
      </form>
    </div>
  </div>
</template>
