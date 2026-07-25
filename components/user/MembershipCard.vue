<script setup lang="ts">
  const membershipYear = getMembershipYear();
</script>
<template>
  <UserCard image="/aiguilles_rouges.jpg">
    <template #title>
      You have a valid membership for {{ membershipYear - 2000 }}-{{
        membershipYear - 2000 + 1
      }}
      ✅</template
    >
    <template #description>
      🎉 Congratulations! You're all set for the upcoming academic year.
    </template>
  </UserCard>
</template>
