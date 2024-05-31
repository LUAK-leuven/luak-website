<script setup lang="ts">
const user = useSupabaseUser();
</script>
<template>
  <FullPageCard>
    <template #title> My Profile </template>
    <span v-if="!user">Not logged in yet</span>
    <div v-else>
      <h2>Hi {{ user.user_metadata.firstName }} 👋</h2>
      <div class="m-10">
        <UserBuyMembershipCard />
      </div>
    </div>
  </FullPageCard>
</template>
