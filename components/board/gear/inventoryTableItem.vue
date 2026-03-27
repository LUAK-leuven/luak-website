<script setup lang="ts">
  import type { Enums } from '~/types/database.types';

  defineProps<{
    status: Enums<'gear_status'>;
  }>();
</script>
<template>
  <div
    class="border p-1"
    :class="{ 'bg-gray-100 italic': status === 'archived' }">
    <slot />
  </div>
</template>
