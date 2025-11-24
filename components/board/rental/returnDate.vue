<script setup lang="ts">
  import dayjs from 'dayjs';
  const props = defineProps<{
    date: string;
  }>();

  const isLate = props.date < dayjs().format('YYYY-MM-DD');
  const isAlmostLate = props.date < dayjs().add(7, 'd').format('YYYY-MM-DD');
</script>

<template>
  <span
    class="rounded-2xl p-1 px-2 text-nowrap"
    :class="isLate ? 'bg-red-300' : isAlmostLate ? 'bg-yellow-200' : ''">
    {{ date }}
  </span>
</template>
