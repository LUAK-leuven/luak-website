<script setup lang="ts">
useHead({
  htmlAttrs: {
    "data-theme": "nord",
  },
});
</script>
<template>
  <NavBar />
  <main class="overflow-hidden">
    <NuxtPage />
  </main>
  <Footer />
</template>
