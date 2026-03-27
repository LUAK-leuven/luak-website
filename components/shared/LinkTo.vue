<script setup lang="ts">
  defineProps<{ text: string; to: string }>();
</script>
<template>
  <NuxtLink class="flex flex-row gap-1 items-center" :to="to">
    <span>{{ text }}</span>
    <span class="material-symbols-outlined text-base"> open_in_new </span>
  </NuxtLink>
</template>
