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
  <div class="form-control">
    <label class="input input-bordered border-2 h-8 flex w-fit">
      <input
        v-model="model"
        class="max-w-10 flex-shrink"
        :class="textBoxColor"
        type="number" />
      <slot name="label-end" />
    </label>
  </div>
</template>
