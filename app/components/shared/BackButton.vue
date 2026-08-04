<script setup lang="ts">
  import Button from './Button.vue';

  const router = useRouter();
</script>
<template>
  <Button
    class="absolute btn btn-circle btn-sm btn-outline top-10 left-10"
    @click="router.back()">
    <span class="material-symbols-outlined">arrow_back</span>
  </Button>
</template>
