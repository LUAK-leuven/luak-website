<template>
  <label class="form-control w-full mb-2">
    <div class="label">
      <span class="label-text">{{ label }}</span>
    </div>
    <Field
      :name="name"
      :type="type"
      :placeholder="placeholder"
      class="input input-bordered w-full"
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
  type: {
    type: String,
    default: "text",
  },
  name: {
    type: String,
    default: "text",
  },
  placeholder: {
    type: String,
    default: "text",
  },
});
</script>
