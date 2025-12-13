<script setup lang="ts">
  import type { Enums } from '~/types/database.types';

  const props = defineProps<{ status: Enums<'rental_status'> }>();

  const labels: Record<Enums<'rental_status'>, [string, string]> = {
    not_returned: ['Not returned', 'bg-red-200'],
    partially_returned: ['Partially returned', 'bg-yellow-200'],
    returned: ['Returned', 'bg-green-200'],
  };
  const x = computed(() => labels[props.status]);
</script>

<template>
  <span class="badge" :class="x[1]">{{ x[0] }}</span>
</template>
