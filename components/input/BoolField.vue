<script setup lang="ts">
  import { useField } from 'vee-validate';

  const props = withDefaults(
    defineProps<{
      name: string;
      type?: 'checkbox';
    }>(),
    { type: 'checkbox' },
  );

  const { checked, handleChange, errorMessage } = useField(
    () => props.name,
    '',
    {
      // Will make the checkbox set its value to true/false if it was checked or not
      type: 'checkbox',
      checkedValue: true,
      uncheckedValue: false,
    },
  );
</script>

<template>
  <div class="my-5 flex content-center">
    <span class="mr-3">
      <slot />
    </span>
    <input
      :class="type"
      type="checkbox"
      :checked="checked"
      @change="handleChange" />
  </div>
  <span class="text-error">{{ errorMessage }}</span>
</template>
