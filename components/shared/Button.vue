<script setup lang="ts">
  defineProps<{
    disabled?: boolean;
    type?: HTMLButtonElement['type'];
  }>();

  const emit = defineEmits<{
    click: [];
  }>();

  const _disabled = ref(true);
  onMounted(() => (_disabled.value = false));
</script>

<template>
  <button
    class="btn"
    :disabled="disabled || _disabled"
    :type="type"
    @click="emit('click')">
    <slot />
  </button>
</template>
