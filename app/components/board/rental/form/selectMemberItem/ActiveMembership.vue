<script setup lang="ts">
  defineProps<{
    name: string;
  }>();
</script>
<template>
  <div class="bg-green-100">
    {{ name }}
  </div>
</template>
