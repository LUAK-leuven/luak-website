<script setup lang="ts">
const supabase = useSupabaseClient();
const email = ref("");
const password = ref("");

const signInWithPassword = async () => {
  const { error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  });
  if (error) console.log(error);
};
</script>
<template>
  <div class="relative flex flex-wrap justify-center z-2 bg-base-300">
    <div
      class="bg-base-100 shadow-md rounded w-10/12 lg:w-8/12 xl:w-1/3 mb-28 z-10 mt-72 p-20"
    >
      <div>
        <label class="form-control w-full">
          <div class="label">
            <span class="label-text">Email</span>
          </div>
          <input
            v-model="email"
            type="email"
            placeholder="youremail@example.com"
            class="input input-bordered w-full"
          />
        </label>
        <label class="form-control w-full">
          <div class="label">
            <span class="label-text">Password</span>
          </div>
          <input
            v-model="password"
            type="password"
            placeholder="******"
            class="input input-bordered w-full"
          />
        </label>
        <div class="flex justify-center">
          <button
            class="btn btn-primary w-full m-5"
            @click="signInWithPassword"
          >
            Log In
          </button>
        </div>
        <div class="divider">OR</div>
        <div class="flex justify-center">
          <button class="btn btn-primary btn-outline w-full m-5">
            Sign up
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
