<script setup lang="ts">
import * as yup from "yup";
import type { SubmissionContext } from "vee-validate";
import { Form as VeeForm } from "vee-validate";

const supabase = useSupabaseClient();
const formSchema = yup.object({
  email: yup.string().required().email(),
  password: yup.string().required().min(6)
});
interface formValues extends yup.InferType<typeof formSchema> {}

async function onSubmit({ email, password }: formValues, actions: SubmissionContext) {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    actions.setFieldError('password', error.message)
  }
  else await navigateTo('/confirmLogin')
}
</script>
<template>
  <div class="relative flex flex-wrap justify-center z-2 bg-base-300">
    <div
      class="bg-base-100 shadow-md rounded w-10/12 lg:w-8/12 xl:w-1/3 mb-28 z-10 mt-8 p-20"
    >
      <VeeForm
        v-slot="{ isSubmitting, handleSubmit }"
        :validation-schema="formSchema"
        as="div"
      >
      <form @submit="handleSubmit($event, onSubmit)">
        <InputText
          label="Email"
          name="email"
          placeholder="youremail@example.com"
          type="email"
        />
        <InputText
          label="Password"
          name="password"
          placeholder="*******"
          type="password"
        />
        <div>
          <button class="btn btn-primary w-full p-5">
            <span v-if="isSubmitting" class="loading loading-spinner"
              >loading</span
            >
            <span v-else>Sign in</span>
          </button>
          <div class="divider">OR</div>
          <NuxtLink to="/signup">
            <button class="btn btn-outline btn-primary w-full p-5">Create an account</button>
          </NuxtLink>
        </div>
      </form>
      </VeeForm>
    </div>
  </div>
</template>
