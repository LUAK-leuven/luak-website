<template>
    <div>
        <NavBar class="absolute" />
        <div class="h-20 w-full bg-base-300"/>
        <main class="overflow-hidden">
        <slot />
        </main>
        <FooterItem />
    </div>
  </template>