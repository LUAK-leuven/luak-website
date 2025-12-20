<script setup lang="ts">
  const popup = usePopup();
</script>

<template>
  <NavBar class="absolute">
    <div class="h-20 w-full bg-base-300" />
    <main class="overflow-hidden w-full">
      <slot />

      <PopUpV2
        v-if="popup !== undefined"
        :type="popup.type"
        @close="popup = undefined">
        {{ popup.message }}
      </PopUpV2>
    </main>
    <FooterItem />
  </NavBar>
</template>
