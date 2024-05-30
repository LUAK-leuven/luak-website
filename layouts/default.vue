<template>
  <NavBar class="absolute">
    <div class="h-20 w-full bg-base-300" />
    <main class="overflow-hidden w-full">
      <slot />
    </main>
    <FooterItem />
  </NavBar>
</template>
