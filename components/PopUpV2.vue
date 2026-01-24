<script setup lang="ts">
  const props = defineProps<{
    type: 'success' | 'warning' | 'error' | 'info';
  }>();
  const emit = defineEmits<{
    close: [];
  }>();
  const alert_type = ref<string>();
  watch(props, () => {
    alert_type.value = `alert-${props.type}`;
  });
</script>

<template>
  <div
    class="alert fixed z-50 w-[90%] mx-[5%] md:w-[80%] md:mx-[10%] bottom-0 right-0 mb-5 flex justify-between"
    :class="{
      'alert-info': type === 'info',
      'alert-success': type === 'success',
      'alert-warning': type === 'warning',
      'alert-error': type === 'error',
    }"
    role="alert">
    <slot />
    <button
      class="btn btn-sm btn-circle btn-ghost text-xl self-center items-end"
      @click="emit('close')">
      ✕
    </button>
  </div>
</template>
