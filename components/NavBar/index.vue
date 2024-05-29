<template>
  <div class="drawer">
    <input id="my-drawer-3" type="checkbox" class="drawer-toggle" />

    <div class="drawer-content flex flex-col">
      <!-- Navbar -->
      <div class="flex justify-center top-3 z-40 w-full fixed">
        <div class="navbar bg-base-200 w-11/12 rounded-md">
          <div class="flex-1">
            <NuxtLink to="/" class="btn btn-ghost p-1">
              <NuxtImg src="/luak-logo.png" class="h-full" :quality="50" />
            </NuxtLink>
          </div>
          <div class="flex-none hidden md:block">
            <NavBarMenu class="menu-horizontal px-1" />
          </div>
          <NavBarHamburgerButton />
        </div>
      </div>
      <slot />
    </div>
    <div class="drawer-side z-50">
      <label
        for="my-drawer-3"
        aria-label="close sidebar"
        class="drawer-overlay"
      />
      <NavBarMenu class="p-4 w-80 min-h-full bg-base-200" />
    </div>
  </div>
</template>
