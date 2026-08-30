<script setup lang="ts">
  defineProps<{
    disabled?: boolean;
    type?: HTMLButtonElement['type'];
    tabindex?: number;
    title?: string | undefined;
    [key: `aria-${string}`]: string | undefined;
  }>();

  const emit = defineEmits<{
    click: [];
  }>();

  const _disabled = ref(true);
  onMounted(() => (_disabled.value = false));
</script>

<template>
  <button
    :disabled="disabled || _disabled"
    :type="type"
    :tabindex="tabindex"
    :title="title"
    v-bind="$attrs"
    @click="emit('click')">
    <slot />
  </button>
</template>
