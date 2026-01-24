<script setup></script>
<template>
  <div class="collapse collapse-arrow border border-base-300 bg-base-200 my-5">
    <input type="checkbox" />
    <div class="collapse-title text-xl font-medium">
      <slot name="title" unwrap="p" />
    </div>
    <div class="collapse-content">
      <slot name="content" unwrap="p" />
    </div>
  </div>
</template>
