<script setup lang="ts">
  const supabase = useSupabaseClient();
  const logout = async () => {
    await supabase.auth.signOut();
    return navigateTo('/login');
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
      <button
        class="btn btn-error"
        data-testId="profile.logout"
        @click="logout">
        Log out
      </button>
    </template>
  </UserCard>
</template>
