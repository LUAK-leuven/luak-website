<script setup lang="ts">
  const luak_year = getLuakYear();
</script>
<template>
  <UserCard image="/aiguilles_rouges.jpg">
    <template #title>
      You have a valid membership for {{ luak_year - 2000 }}-{{
        luak_year - 2000 + 1
      }}
      ✅</template
    >
    <template #description>
      🎉 Congratulations! You're all set for the upcoming academic year.
    </template>
  </UserCard>
</template>
