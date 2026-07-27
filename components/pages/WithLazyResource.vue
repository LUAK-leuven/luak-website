<script setup lang="ts" generic="T">
  withDefaults(
    defineProps<{
      data: T | undefined | null;
      isLoading: boolean;
      error?: string | undefined | null;
      defaultError?: string | undefined;
    }>(),
    {
      defaultError: undefined,
      error: undefined,
    },
  );
</script>
<template>
  <div v-if="error">ERROR: {{ error }}</div>

  <div v-else-if="isLoading" class="flex justify-center items-center py-10">
    <span class="loading loading-spinner loading-lg" />
  </div>

  <div v-else-if="!data">{{ defaultError ?? 'Failed to load page data' }}</div>

  <template v-else>
    <slot :data="data" />
  </template>
</template>
