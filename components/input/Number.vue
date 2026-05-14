<script setup lang="ts">
  withDefaults(
    defineProps<{
      textBoxColor?: '' | 'input-warning' | 'input-error';
    }>(),
    { textBoxColor: '' },
  );

  const model = defineModel<number | undefined>();

  function setModel(value: string | null) {
    if (value === null || value === '') model.value = undefined;
    else model.value = +value;
  }
</script>

<template>
  <div class="form-control">
    <label class="input input-bordered border-2 h-8 flex w-fit">
      <input
        class="max-w-10 flex-shrink"
        :class="textBoxColor"
        :value="model"
        type="number"
        @input="(e) => setModel((e.target as HTMLInputElement).value)" />
      <slot name="label-end" />
    </label>
  </div>
</template>
