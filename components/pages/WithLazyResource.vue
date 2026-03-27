<script setup lang="ts" generic="T">
  defineProps<{ data: T; isLoading: boolean; error?: string }>();
</script>
<template>
  <div v-if="error">ERROR: {{ error }}</div>

  <div v-else-if="isLoading" class="flex justify-center items-center py-10">
    <span class="loading loading-spinner loading-lg"></span>
  </div>

  <div v-else-if="!data">ERROR!</div>

  <template v-else>
    <slot :data="data" />
  </template>
</template>
