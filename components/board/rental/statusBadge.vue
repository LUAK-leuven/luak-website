<script setup lang="ts">
  import type { RentalStatus } from '~/types/rental';

  const props = defineProps<{ status: RentalStatus }>();

  const labels: Record<RentalStatus, [string, string]> = {
    not_returned: ['Not returned', 'bg-red-200'],
    partially_returned: ['Partially returned', 'bg-yellow-200'],
    returned: ['Returned', 'bg-green-200'],
    reserved: ['Reserved', 'bg-blue-200'],
  };
  const x = computed(() => labels[props.status]);
</script>

<template>
  <span class="badge" :class="x[1]">{{ x[0] }}</span>
</template>
