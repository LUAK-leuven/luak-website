<script setup lang="ts">
  withDefaults(
    defineProps<{
      textBoxColor?: '' | 'input-warning' | 'input-error';
    }>(),
    { textBoxColor: '' },
  );

  const model = defineModel<number>();
</script>

<template>
  <label class="form-control max-w-20">
    <input
      v-model="model"
      class="input input-bordered border-2 h-8"
      :class="textBoxColor"
      type="number" />
  </label>
</template>
