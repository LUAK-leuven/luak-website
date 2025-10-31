<script setup lang="ts">
  const supabase = useSupabaseClient();
  const logout = () => {
    supabase.auth.signOut();
  };
  const user = useSupabaseUser();
</script>
<template>
  <UserCard image="/chardonnet.jpg">
    <template #title> Log out 👋</template>
    <template #description>
      You are currently logged in as
      <strong>{{ user?.email }}</strong>
    </template>
    <template #actions>
      <button class="btn btn-error" @click="logout">Log out</button>
    </template>
  </UserCard>
</template>
