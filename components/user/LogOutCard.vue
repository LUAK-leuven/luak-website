<script setup lang="ts">
  import Button from '../shared/Button.vue';

  const supabase = useSupabaseClient();
  const logout = async () => {
    await supabase.auth.signOut();
    return navigateTo({ name: 'login' });
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
      <Button class="btn-error" data-testId="profile.logout" @click="logout">
        Log out
      </Button>
    </template>
  </UserCard>
</template>
