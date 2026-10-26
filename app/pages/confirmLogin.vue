<script setup lang="ts">
  const user = useSupabaseUser();

  const redirectInfo = useSupabaseCookieRedirect();

  watch(
    user,
    async () => {
      if (user.value) {
        const path = redirectInfo.pluck();
        await navigateTo(path || '/profile/overview');
      }
    },
    { immediate: true },
  );
</script>
<template>
  <div>Waiting for login...</div>
</template>
