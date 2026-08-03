<script setup lang="ts">
  import type { InputTypeHTMLAttribute } from 'vue';

  defineProps<{
    type: InputTypeHTMLAttribute;
    tabindex?: number;
    placeholder?: string;
    disabled?: boolean;
    autocomplete?: AutoFillField | undefined;
  }>();

  const model = defineModel<string | number | undefined>();

  const emit = defineEmits<{
    focus: [];
    blur: [];
  }>();

  const _disabled = ref(true);
  onMounted(() => (_disabled.value = false));
</script>

<template>
  <input
    v-model="model"
    :disabled="_disabled || disabled"
    :type="type"
    :tabindex="tabindex"
    :placeholder="placeholder"
    :autocomplete="autocomplete"
    @focus="emit('focus')"
    @blur="emit('blur')" />
</template>
