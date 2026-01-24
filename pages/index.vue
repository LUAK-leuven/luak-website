<script setup lang="ts">
  definePageMeta({
    layout: 'picture',
  });
  const NR_OF_ARTICLES = 3;
  const { data } = await useAsyncData(() =>
    queryCollection('news').order('date', 'ASC').limit(NR_OF_ARTICLES).all(),
  );
</script>
<template>
  <div>
    <div
      class="hero min-h-[80vh] z-10"
      style="background-image: url(/kandersteg.jpg); background-size: cover">
      <div class="hero-overlay bg-opacity-60" />
      <div class="hero-content text-left text-neutral-content my-20">
        <div class="max-w-md">
          <NuxtImg src="/luak-logo-white.png" :placeholder="[448, 221]" />
          <p class="mb-5 text-lg">
            Leuvense Universitaire Alpinisten Klub ⛰️ Alpine club in leuven for
            outdoors lovers from beginners to more seasoned climbers 🧗
          </p>
          <NuxtLink class="btn btn-primary m-2" to="/activities">
            Check our activities
          </NuxtLink>
          <NuxtLink
            class="btn btn-outline m-2 text-white"
            to="/pages/become_a_member">
            Become a member
          </NuxtLink>
        </div>
      </div>
    </div>
    <div class="relative flex flex-wrap justify-center z-2 bg-base-300">
      <div
        class="bg-base-100 shadow-md md:basis-9/12 basis-11/12 shrink-0 grow-0 rounded-lg px-5"
        style="margin-top: -5em">
        <NuxtLink to="/news">
          <h1 class="w-full text-center text-6xl mt-10 mb-5">News</h1>
        </NuxtLink>
        <NewsItem
          v-for="(newsItem, index) in data"
          :key="newsItem.path"
          v-bind="{ data: newsItem, reversed: !!((index + 1) % 2) }" />
      </div>
      <div
        class="bg-base-100 shadow-md md:basis-9/12 basis-11/12 shrink-0 grow-0 rounded my-5">
        <NuxtLink to="/activities">
          <h1 class="w-full text-center text-6xl my-10">Activities</h1>
        </NuxtLink>
        <div class="p-5">
          <GoogleCalendar />
        </div>
      </div>
    </div>
  </div>
</template>
