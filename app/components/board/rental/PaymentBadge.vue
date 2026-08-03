<script setup lang="ts">
  defineProps<{
    paymentMethod: Database['public']['Enums']['payment_method'];
  }>();
</script>

<template>
  <span class="badge badge-info">{{ paymentMethod }}</span>
</template>
