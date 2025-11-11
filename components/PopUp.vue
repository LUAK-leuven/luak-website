<script setup lang="ts">
  const { show } = defineProps({
    show: {
      type: Boolean,
      required: true,
    },
  });
</script>

<template>
  <div
    v-if="show"
    class="alert alert-success fixed z-50 w-[90%] mx-[5%] md:w-[80%] md:mx-[10%] bottom-0 mb-5 flex justify-between"
    role="alert">
    <slot />
    <button
      class="btn btn-sm btn-circle btn-ghost text-xl self-center items-end">
      ✕
    </button>
  </div>
</template>
