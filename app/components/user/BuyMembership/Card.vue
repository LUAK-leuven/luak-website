<script setup lang="ts">
  import { getCurrentMembershipYear } from '~/model/Membership';

  const membershipYear = getCurrentMembershipYear();
</script>
<template>
  <UserCard image="/aiguilles_rouges.jpg">
    <template #title>
      Not yet a member for {{ membershipYear }}-{{ membershipYear + 1 }} 😢
    </template>
    <template #description>
      Take part in our activities and enjoy the benefits of being a member.
    </template>
    <template #actions>
      <UserBuyMembershipModal />
    </template>
  </UserCard>
</template>
