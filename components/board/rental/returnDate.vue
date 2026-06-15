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

  const isLate =
    !props.ghost && props.date < dayjs().add(1, 'd').format('YYYY-MM-DD');
  const isAlmostLate =
    !props.ghost &&
    !isLate &&
    props.date < dayjs().add(7, 'd').add(1, 'd').format('YYYY-MM-DD');

  const formattedDate = computed(() => dayjs(props.date).format('DD-MM-YYYY'));
</script>

<template>
  <span
    class="badge"
    :class="{ 'badge-error': isLate, 'badge-warning': isAlmostLate }">
    {{ formattedDate }}
  </span>
</template>
