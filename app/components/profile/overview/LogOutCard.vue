<script setup lang="ts">
  import Button from '~/components/shared/Button.vue';
  import ProfileCard from '~/components/profile/overview/Card.vue';

  const supabase = useSupabaseClient();
  const logout = async () => {
    await supabase.auth.signOut();
    return navigateTo({ name: 'login' });
  };
  const user = useSupabaseUser();
</script>
<template>
  <ProfileCard image="/chardonnet.jpg">
    <template #title> Log out 👋</template>
    <template #description>
      You are currently logged in as
      <strong>{{ user?.email }}</strong>
    </template>
    <template #actions>
      <Button
        class="btn btn-error"
        data-testId="profile.logout"
        @click="logout">
        Log out
      </Button>
    </template>
  </ProfileCard>
</template>
