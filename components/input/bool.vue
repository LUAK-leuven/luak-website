<script setup lang="ts">
import { useField } from "vee-validate";

const props = defineProps({
  name: {
    type: String,
    default: "checkbox",
  },
  label: {
    type: String,
    default: "checkbox",
  },
});

const { checked, handleChange } = useField(() => props.name, "", {
  // Will make the checkbox set its value to true/false if it was checked or not
  type: "checkbox",
  checkedValue: true,
  uncheckedValue: false,
});
</script>

<template>
  <div class="my-5 flex content-center">
    <span class="mr-3">{{ label }}</span>
    <input
      type="checkbox"
      class="checkbox"
      :checked="checked"
      @change="handleChange"
    />
  </div>
</template>
