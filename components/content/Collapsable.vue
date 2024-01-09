<script setup></script>
<template>
  <div
    tabindex="0"
    class="collapse collapse-arrow border border-base-300 bg-base-200 mx-2 my-5"
  >
    <div class="collapse-title text-xl font-medium">
      <ContentSlot :use="$slots.title" unwrap="p" />
    </div>
    <div class="collapse-content mx-5">
      <ContentSlot :use="$slots.content" unwrap="p" />
    </div>
  </div>
</template>
