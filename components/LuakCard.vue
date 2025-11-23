<script setup lang="ts">
  defineProps<{ to?: string }>();
</script>
<template>
  <NuxtLink
    v-if="to !== undefined"
    class="bg-base-100 shadow-md w-full shrink-0 grow-0 rounded-xl px-8 py-6 md:p-10"
    :to="to">
    <slot />
  </NuxtLink>
  <div
    v-else
    class="bg-base-100 shadow-md w-full shrink-0 grow-0 rounded-xl px-8 py-6 md:p-10">
    <slot />
  </div>
</template>
