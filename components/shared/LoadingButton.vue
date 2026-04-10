<script setup lang="ts">
  const props = withDefaults(
    defineProps<{
      text: string;
      disabled?: boolean;
      clickHandler: () => Promise<unknown>;
      type?: HTMLButtonElement['type'];
    }>(),
    { disabled: false, type: 'submit' },
  );

  const isSubmitting = ref(false);

  const onClick = async () => {
    isSubmitting.value = true;
    await props.clickHandler();
    isSubmitting.value = false;
  };
</script>
<template>
  <button
    class="btn btn-primary w-fit"
    :class="{ 'btn-disabled': disabled }"
    :disabled="disabled"
    :type="type"
    @click="onClick">
    <span v-if="isSubmitting" class="loading loading-spinner" data-testId="loading">loading</span>
    <span v-else data-testId="button-text">{{ text }}</span>
  </button>
</template>
