<script setup lang="ts">
  import dayjs from 'dayjs';
  import type { RetirementDate } from '~~/shared/types/gear';

  const props = defineProps<{
    retirementDate: RetirementDate;
  }>();

  const badge = computed<[string, string]>(() => {
    if (props.retirementDate === 'infinite') return ['badge-ghost', '-'];
    if (props.retirementDate === 'missing info') return ['badge-warning', '⚠'];

    const today = dayjs().toISOString();
    const retirementDate = dayjs(props.retirementDate);
    const formattedDate = retirementDate.format('MMM YYYY');

    if (retirementDate.toISOString() <= today)
      return ['badge-error', formattedDate];
    if (retirementDate.subtract(1, 'year').toISOString() <= today)
      return ['badge-warning', formattedDate];
    return ['bg-opacity-0 border-opacity-0', formattedDate];
  });
</script>
<template>
  <span class="badge w-max" :class="badge[0]">
    {{ badge[1] }}
  </span>
</template>
