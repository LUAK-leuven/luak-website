<template>
  <NavBar class="absolute">
    <div class="h-20 w-full bg-base-300" />
    <main class="overflow-hidden w-full">
      <div class="relative w-full flex flex-col items-center bg-base-300 pb-28">
        <h1 class="w-[100vw] text-center text-5xl mt-16 mb-10">
          <slot name="title" />
        </h1>
        <div class="flex flex-col items-center gap-3 md:w-9/12 w-11/12">
          <slot />
        </div>
      </div>
    </main>
    <FooterItem />
  </NavBar>
</template>
