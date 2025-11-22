<script setup lang="ts">
  const { type } = defineProps<{
    type: 'success' | 'warning' | 'error' | 'info';
  }>();
  const show = defineModel<boolean>('show', { required: true });
</script>

<template>
  <div
    v-if="show"
    class="alert fixed z-50 w-[90%] mx-[5%] md:w-[80%] md:mx-[10%] bottom-0 right-0 mb-5 flex justify-between"
    :class="`alert-${type}`"
    role="alert">
    <slot />
    <button
      class="btn btn-sm btn-circle btn-ghost text-xl self-center items-end"
      @click="show = false">
      ✕
    </button>
  </div>
</template>
