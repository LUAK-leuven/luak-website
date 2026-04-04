<script setup lang="ts" generic="T">
  const props = withDefaults(
    defineProps<{
      text: string;
      disabled?: boolean;
      clickHandler: () => Promise<T>;
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
    :type="type"
    @click="onClick">
    <span v-if="isSubmitting" class="loading loading-spinner">loading</span>
    <span v-else>{{ text }}</span>
  </button>
</template>
