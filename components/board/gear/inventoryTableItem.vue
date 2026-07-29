<script setup lang="ts">
  defineProps<{
    isArchived: boolean;
  }>();
</script>
<template>
  <div
    class="border p-1"
    :class="{
      'bg-gray-100 italic': isArchived,
      'bg-inherit': !isArchived,
    }">
    <slot />
  </div>
</template>
