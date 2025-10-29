<template>
  <div class="drawer">
    <input id="my-drawer-3" class="drawer-toggle" type="checkbox" />

    <div class="drawer-content flex flex-col">
      <!-- Navbar -->
      <div class="flex justify-center top-3 z-40 w-full fixed">
        <div class="navbar bg-base-200 w-11/12 rounded-md">
          <div class="flex-1">
            <NuxtLink class="btn btn-ghost p-1" to="/">
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
        aria-label="close sidebar"
      />
      <NavBarMenu class="p-4 w-80 min-h-full bg-base-200" />
    </div>
  </div>
</template>
