<script lang="ts" setup>
  defineProps<{
    name: string;
  }>();
</script>
<template>
  <div class="bg-blue-100">
    {{ name }}
  </div>
</template>
