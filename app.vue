<script setup lang="ts">
useHead({
  htmlAttrs: {
    "data-theme": "nord",
  },
});
</script>
<template>
  <NavBar class="absolute" />
  <main class="overflow-hidden">
    <NuxtPage />
  </main>
  <Footer />
</template>
