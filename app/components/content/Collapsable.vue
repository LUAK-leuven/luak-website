<script lang="ts" setup>
  withDefaults(
    defineProps<{
      open?: boolean;
    }>(),
    { open: false },
  );
</script>
<template>
  <div class="collapse collapse-arrow border border-base-300 bg-base-200 my-5">
    <input type="checkbox" :checked="open" />
    <div class="collapse-title text-xl font-medium">
      <slot name="title" mdc-unwrap="p" />
    </div>
    <div class="collapse-content">
      <slot name="content" mdc-unwrap="p" />
    </div>
  </div>
</template>
