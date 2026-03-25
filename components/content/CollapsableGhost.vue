<script lang="ts" setup>
  withDefaults(
    defineProps<{
      open?: boolean;
    }>(),
    { open: false },
  );
</script>
<template>
  <div class="collapse collapse-arrow">
    <input type="checkbox" :checked="open" />
    <div class="collapse-title">
      <slot name="title" mdc-unwrap="p" />
    </div>
    <div class="collapse-content">
      <slot name="content" mdc-unwrap="p" />
    </div>
  </div>
</template>
