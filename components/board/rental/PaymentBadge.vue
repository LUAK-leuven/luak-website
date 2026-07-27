<script setup lang="ts">
  import type { Database } from '~/types/database.types';

  defineProps<{
    paymentMethod: Database['public']['Enums']['payment_method'];
  }>();
</script>

<template>
  <span class="badge badge-info">{{ paymentMethod }}</span>
</template>
