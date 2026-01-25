<script setup lang="ts">
  defineProps<{ arrow_back?: string }>();
</script>
<template>
  <FullPageCard>
    <template #title> Page Not Found </template>

    <NuxtLink
      v-if="arrow_back"
      class="btn btn-circle btn-sm btn-outline mb-5"
      :to="arrow_back">
      <span class="material-symbols-outlined">arrow_back</span>
    </NuxtLink>
    <div class="text-center">
      <p>Oops! The content you're looking for doesn't exist.</p>
      <NuxtLink class="link" to="/">Go back home</NuxtLink>
    </div>
  </FullPageCard>
</template>
