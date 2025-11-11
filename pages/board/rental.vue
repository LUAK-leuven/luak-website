<script setup lang="ts">
  const { boardMember, error } = await isBoardMember();
</script>

<template>
  <FullPageCard>
    <div v-if="error">{{ error }}</div>
    <div v-else>Success</div>
  </FullPageCard>
</template>
