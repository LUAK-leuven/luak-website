<script setup lang="ts">
  import { useField } from 'vee-validate';
  import type { InputTypeHTMLAttribute } from 'vue';

  const props = withDefaults(
    defineProps<{
      label?: string | undefined;
      type?: InputTypeHTMLAttribute;
      name: string;
      placeholder?: string;
      disabled?: boolean;
      autoFillWithPlaceholder?: boolean;
      round?: boolean;
    }>(),
    {
      type: 'text',
      placeholder: 'text',
      disabled: false,
      autoFillWithPlaceholder: false,
      label: undefined,
      round: false,
    },
  );

  const model = defineModel<string>();

  const { value, errorMessage } = useField<string | undefined>(
    () => props.name,
  );
  effect(() => {
    if (value.value === '') value.value = undefined;
    model.value = value.value;
  });
  onBeforeMount(() => {
    if (model.value !== undefined) {
      value.value = model.value;
    }
  });

  function onFocus() {
    if (props.autoFillWithPlaceholder && value === undefined) model.value = props.placeholder;
  }
</script>

<template>
  <div class="form-control w-full">
    <div v-if="label" class="label">
      <span class="label-text">{{ label }}</span>
    </div>
    <label
      class="input input-bordered w-full flex items-center"
      :class="{ 'bg-gray-300': disabled, ' rounded-full': round }">
      <slot name="label1" />
      <input
        v-model="value"
        class="w-full"
        :class="{ 'bg-gray-300': disabled }"
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        @focus="onFocus()" />
    </label>
    <span v-if="errorMessage" class="text-error">{{ errorMessage }}</span>
  </div>
</template>
