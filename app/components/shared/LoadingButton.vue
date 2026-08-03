<script setup lang="ts">
  import Button from './Button.vue';

  const props = withDefaults(
    defineProps<{
      text: string;
      disabled?: boolean;
      clickHandler: () => Promise<void>;
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
  <Button
    class="btn btn-primary w-fit"
    :class="{ 'btn-disabled': disabled }"
    :disabled="disabled"
    :type="type"
    @click="onClick">
    <span
      v-if="isSubmitting"
      class="loading loading-spinner"
      data-testId="loading" />
    <span v-else data-testId="button-text">{{ text }}</span>
  </Button>
</template>
