<script setup lang="ts">
  import BackButton from '~/components/shared/BackButton.vue';
</script>
<template>
  <FullPageCard>
    <template #title> Climbing Gear Retirement </template>

    <BackButton :to="{ name: 'board' }" />

    <p class="text-center text-2xl">🚧 Coming soon... 🚧</p>
  </FullPageCard>
</template>
