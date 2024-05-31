<template>
  <label class="form-control w-full mb-2">
    <div class="label">
      <span class="label-text">{{ label }}</span>
    </div>
    <input
      v-model="textValue"
      :type="type"
      :placeholder="placeholder"
      class="input input-bordered w-full"
    />
    <span class="text-error">{{ errorMessage }}</span>
  </label>
</template>

<script setup>
import { useField } from "vee-validate";

const props = defineProps({
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

// The `name` is returned in a function because we want to make sure it stays reactive
// If the name changes you want `useField` to be able to pick it up
const { textValue, errorMessage } = useField(() => props.name);
</script>
