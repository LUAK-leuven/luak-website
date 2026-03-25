<script setup lang="ts">
  const { close, state } = usePopup();
</script>

<template>
  <NavBar class="absolute bg-base-300">
    <main class="overflow-hidden w-full mt-20">
      <slot />
      <PopUpV2 v-if="state !== undefined" :type="state.type" @close="close">
        {{ state.message }}
      </PopUpV2>
    </main>
    <FooterItem />
  </NavBar>
</template>
