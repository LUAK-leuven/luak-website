<script setup lang="ts">
const user = useSupabaseUser();
</script>
<template>
  <FullPageCard>
    <template #title> Member Page </template>
    <span v-if="user">Hi {{ user.user_metadata.firstName }}</span>
    <span v-else> Not Logged in yet</span>
  </FullPageCard>
</template>
