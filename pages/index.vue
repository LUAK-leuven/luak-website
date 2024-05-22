<script setup>
const NR_OF_ARTICLES = 5;
const { data } = await useAsyncData(() =>
  queryContent("/news")
    .only(["title", "image", "excerpt", "_path"])
    .limit(NR_OF_ARTICLES)
    .find(),
);
</script>
<template>
  <div>
    <div
      class="hero min-h-[80vh] z-10"
      style="background-image: url(/kandersteg.jpg); background-size: cover"
    >
      <div class="hero-overlay bg-opacity-60" />
      <div class="hero-content text-left text-neutral-content my-20">
        <div class="max-w-md">
          <NuxtImg src="/luak-logo-white.png" :placeholder="[448, 221]" />
          <p class="mb-5 text-lg">
            Leuvense Universitaire Alpinisten Klub ⛰️ Alpine club in leuven for
            outdoors lovers from beginners to more seasoned climbers 🧗
          </p>
          <NuxtLink to="/calendar"
            ><button class="btn btn-primary m-2">
              Check our activities
            </button></NuxtLink
          >
          <button class="btn btn-outline m-2 text-white">
            Become a member
          </button>
        </div>
      </div>
    </div>
    <div class="relative flex flex-wrap justify-center z-2 bg-base-300">
      <div
        class="bg-base-100 shadow-md md:basis-9/12 basis-11/12 shrink-0 grow-0 rounded"
        style="margin-top: -5em"
      >
        <h1 class="w-full text-center text-6xl mt-10 mb-5">News</h1>
        <NewsItem
          v-for="(newsItem, index) in data"
          :key="newsItem._path"
          v-bind="{ data: newsItem, reversed: !!((index + 1) % 2) }"
        />
      </div>
      <div
        class="bg-base-100 shadow-md md:basis-9/12 basis-11/12 shrink-0 grow-0 rounded my-5"
      >
        <h1 class="w-full text-center text-6xl m-10">Activities</h1>
        <div class="flex justify-center mb-10">
          <iframe
            src="https://calendar.google.com/calendar/embed?height=600&wkst=2&bgcolor=%23ffffff&ctz=Europe%2FBrussels&showTabs=0&showTitle=0&showPrint=0&showCalendars=0&src=bmhsNGlmbXJpczlvZXB0OGloYTB2ZTI2anNAZ3JvdXAuY2FsZW5kYXIuZ29vZ2xlLmNvbQ&color=%23EF6C00"
            style="border-width: 0"
            width="800"
            height="600"
            frameborder="0"
            scrolling="no"
          />
        </div>
      </div>
    </div>
  </div>
</template>
