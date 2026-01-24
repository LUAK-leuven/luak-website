<script setup lang="ts">
  const props = defineProps<{
    softMin?: number;
    softMax?: number;
    name: string;
  }>();

  const emit = defineEmits<{
    (e: 'valueChange', value: number): void;
  }>();

  const { value, errorMessage } = useField<number>(() => props.name);
  effect(() => emit('valueChange', value.value));

  const getTextboxColor: (value: number) => string = (value: number) => {
    if (errorMessage.value) return 'input-error';
    if (
      (props.softMin !== undefined && value < props.softMin) ||
      (props.softMax !== undefined && value > props.softMax)
    )
      return 'input-warning';
    return '';
  };
</script>

<template>
  <label class="form-control max-w-20">
    <input
      v-model="value"
      class="input input-bordered border-2 h-8"
      :class="getTextboxColor(value)"
      type="number" />
  </label>
</template>
