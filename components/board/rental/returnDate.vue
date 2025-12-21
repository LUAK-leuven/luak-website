<script setup lang="ts">
  import dayjs from 'dayjs';
  const props = withDefaults(
    defineProps<{
      date: string;
      ghost?: boolean;
    }>(),
    {
      ghost: false,
    },
  );

  const isLate = !props.ghost && props.date < dayjs().format('YYYY-MM-DD');
  const isAlmostLate =
    !props.ghost &&
    !isLate &&
    props.date < dayjs().add(7, 'd').format('YYYY-MM-DD');
</script>

<template>
  <span
    class="rounded-2xl p-1 px-2 text-nowrap"
    :class="{ 'bg-error': isLate, 'bg-warning': isAlmostLate }">
    {{ date }}
  </span>
</template>
