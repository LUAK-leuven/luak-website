<script setup lang="ts">
  defineProps(['url']);
</script>

<template>
  <ClientOnly>
    <div class="responsive-iframe-container">
      <iframe
        :src="url"
        style="border-width: 0"
        frameborder="0"
        scrolling="no" />
    </div>
  </ClientOnly>
</template>

<style>
  /* Responsive iFrame */

  .responsive-iframe-container {
    position: relative;
    padding-bottom: 56.25%;
    padding-top: 30px;
    min-height: 30rem;
    overflow: hidden;
  }

  .responsive-iframe-container iframe,
  .vresponsive-iframe-container object,
  .vresponsive-iframe-container embed {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
</style>
