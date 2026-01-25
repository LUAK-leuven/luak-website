<script setup lang="ts">
  const popup = usePopup();
</script>

<template>
  <NavBar class="absolute bg-base-300">
    <main class="overflow-hidden w-full mt-20">
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
