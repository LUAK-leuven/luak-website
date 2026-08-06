<script setup lang="ts">
  defineProps<{
    name: string;
  }>();
</script>
<template>
  <div class="bg-yellow-100">♻️ {{ name }}</div>
</template>
