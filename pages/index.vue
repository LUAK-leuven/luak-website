<template>
  <div
    class="hero min-h-[80vh] z-10"
    style="background-image: url(/kandersteg.jpg); background-size: cover"
  >
    <div class="hero-overlay bg-opacity-60"></div>
    <div class="hero-content text-left text-neutral-content">
      <div class="max-w-md">
        <NuxtImg src="/luak-logo-white.png" />
        <p class="mb-5">
          Leuvense Universitaire Alpinisten Klub ⛰️ Alpine club in leuven for
          outdoors lovers from beginners to more seasoned climbers 🧗
        </p>
        <button class="btn btn-primary m-2">Check our activities</button>
        <button class="btn btn-outline m-2 text-white">Become a member</button>
      </div>
    </div>
  </div>
  <div class="relative flex flex-wrap justify-center z-2 bg-base-300">
    <div
      class="bg-base-100 basis-9/12 shrink-0 grow-0 rounded"
      style="margin-top: -5em"
    >
      <h1 class="w-full text-center text-7xl m-10">News</h1>
      <NewsItem />
      <div class="divider my-5 mx-20"></div>
      <NewsItem reverse />
    </div>
    <div class="bg-base-100 basis-11/12 shrink-0 grow-0 rounded my-5">
      <h1 class="w-full text-center text-7xl m-10">Activities</h1>
      <NewsItem />
    </div>
  </div>
</template>
