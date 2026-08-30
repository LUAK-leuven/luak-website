<script setup lang="ts">
  import type { InputTypeHTMLAttribute } from 'vue';

  defineProps<{
    type: InputTypeHTMLAttribute;
    tabindex?: number | undefined;
    placeholder?: string | undefined;
    disabled?: boolean;
    autocomplete?: AutoFillField | undefined;
    checked?: boolean;
    id?: string | undefined;
  }>();

  const model = defineModel<string | number | boolean | undefined>({
    required: true,
  });

  const emit = defineEmits<{
    focus: [];
    blur: [];
  }>();

  const _disabled = ref(true);
  onMounted(() => (_disabled.value = false));
</script>

<template>
  <input
    :id="id"
    v-model="model"
    :disabled="_disabled || disabled"
    :type="type"
    :tabindex="tabindex"
    :placeholder="placeholder"
    :autocomplete="autocomplete"
    :checked="checked"
    @focus="emit('focus')"
    @blur="emit('blur')" />
</template>
