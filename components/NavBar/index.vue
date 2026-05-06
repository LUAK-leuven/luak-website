<script setup lang="ts">
  const { data: user } = await useLuakMember();
</script>

<template>
  <div class="drawer">
    <input id="my-drawer-3" class="drawer-toggle" type="checkbox" />

    <div class="drawer-content flex flex-col min-w-0">
      <!-- Navbar -->
      <div class="flex justify-center top-3 z-40 w-full fixed">
        <div class="navbar bg-base-200 w-11/12 rounded-xl">
          <div class="flex-1">
            <NuxtLink class="btn btn-ghost p-1" :to="{ name: 'index' }">
              <NuxtImg class="h-full" src="/luak-logo.png" :quality="50" />
            </NuxtLink>
          </div>
          <div class="flex-none hidden md:block">
            <NavBarMenu class="menu-horizontal px-1 items-center" />
          </div>
          <NavBarHamburgerButton />
        </div>
      </div>

      <slot />
    </div>

    <div class="drawer-side z-50">
      <label
        class="drawer-overlay"
        for="my-drawer-3"
        aria-label="close sidebar" />
      <NavBarMenu
        id="luak_menu_drawer"
        class="p-4 w-80 min-h-full bg-base-200" />
    </div>

    <NuxtLink
      v-if="user.isBoard"
      class="btn btn-lg btn-circle bg-blue-400 m-1 fixed bottom-4 end-4 z-50 hover:bg-blue-300"
      :to="{ name: 'board-rentals-form' }">
      🧗‍♀️
    </NuxtLink>
  </div>
</template>
