<script setup lang="ts">
  const { error } = await checkIsBoardMember();
</script>

<template>
  <FullPageCard>
    <template #title>Rental form 🧗</template>

    <!-- Error message -->
    <div v-if="error" class="alert alert-error">
      <span>{{ error }}</span>
    </div>

    <div v-else>Success</div>
  </FullPageCard>
</template>
