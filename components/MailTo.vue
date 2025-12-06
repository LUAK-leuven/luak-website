<script setup lang="ts">
  defineProps<{ email: string }>();
</script>
<template>
  <a :href="`mailto:${email}`">
    {{ email }}
  </a>
</template>
