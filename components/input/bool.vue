<template>
  <label class="label cursor-pointer">
    <span class="label-text">{{ label }}</span>
    <Field
      type="checkbox"
      class="checkbox"
      :name="name"
      :value="true"
      :unchecked-value="false"
    />
    <ErrorMessage as="span" class="text-error" :name="name" />
  </label>
</template>
<script setup>
import { Field } from "vee-validate";
defineProps({
  label: {
    type: String,
    default: "text",
  },
  name: {
    type: String,
    default: "text",
  },
});
</script>
