<script setup lang="ts">
  const luak_year = getLuakYear();
</script>
<template>
  <UserCard image="/aiguilles_rouges.jpg">
    <template #title>
      Not yet a member for {{ luak_year }}-{{ luak_year + 1 }} 😢
    </template>
    <template #description>
      Take part in our activities and enjoy the benefits of being a member.
    </template>
    <template #actions>
      <UserBuyMembershipModal />
    </template>
  </UserCard>
</template>
