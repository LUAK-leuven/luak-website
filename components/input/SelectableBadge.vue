<script setup lang="ts">
  defineProps<{
    text: string;
  }>();
  const selected = defineModel<boolean>();
</script>
<template>
  <label class="cursor-pointer">
    <input v-model="selected" class="peer hidden" type="checkbox" />
    <span
      class="badge badge-lg"
      :class="
        selected
          ? 'badge-success border border-neutral'
          : 'badge-neutral badge-outline'
      ">
      {{ text }}
    </span>
  </label>
</template>
