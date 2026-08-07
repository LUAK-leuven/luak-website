<script lang="ts" setup>
  defineProps<{
    name: string;
  }>();
</script>
<template>
  <div class="bg-red-100">⚠️{{ name }}</div>
</template>
