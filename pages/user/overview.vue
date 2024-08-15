<script setup lang="ts">
const user = useSupabaseUser();
const has_membership = ref(await getHasMembership());
</script>
<template>
  <FullPageCard>
    <template #title> My Profile </template>
    <span v-if="!user">Not logged in yet</span>
    <template v-else>
      <h2>Hi {{ user.user_metadata.firstName }} 👋</h2>
      Welcome to your profile page. Here you can manage your membership! In the
      future more functionaity will be added.
      <div class="my-5 mx-2 flex flex-wrap justify-around">
        <UserBuyMembershipCard v-if="has_membership !== 'paid_membership'" />
        <UserMembershipCard v-else />
        <UserLogOutCard />
      </div>
    </template>
  </FullPageCard>
</template>
