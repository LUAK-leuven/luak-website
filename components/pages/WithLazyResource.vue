<script setup lang="ts" generic="T">
  withDefaults(
    defineProps<{
      data: T;
      isLoading: boolean;
      error?: string | undefined;
      defaultError?: string;
    }>(),
    {
      defaultError: 'Failed to load page data',
      error: undefined,
    },
  );
</script>
<template>
  <div v-if="error">ERROR: {{ error }}</div>

  <div v-else-if="isLoading" class="flex justify-center items-center py-10">
    <span class="loading loading-spinner loading-lg"></span>
  </div>

  <div v-else-if="!data">{{ defaultError}}</div>

  <template v-else>
    <slot :data="data" />
  </template>
</template>
