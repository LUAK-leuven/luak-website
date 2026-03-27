<script setup lang="ts">
  import type { Dayjs } from 'dayjs';
  import dayjs from 'dayjs';

  const props = defineProps<{
    retirementDate?: Dayjs;
  }>();

  const badgeColor = computed(() => {
    if (props.retirementDate === undefined) return 'badge-warning';
    const today = dayjs().toISOString();
    return props.retirementDate.toISOString() <= today
      ? 'badge-error'
      : props.retirementDate.subtract(1, 'year').toISOString() <= today
        ? 'badge-warning'
        : 'bg-opacity-0 border-opacity-0';
  });
</script>
<template>
  <span class="badge w-max" :class="badgeColor">
    {{ retirementDate?.format('MMM YYYY') ?? '⚠' }}
  </span>
</template>
