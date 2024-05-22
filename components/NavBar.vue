<script setup>
const { data: info_navigation } = await useAsyncData("info_navigation", () =>
  fetchContentNavigation(queryContent("/info")),
);
</script>

<template>
  <div class="flex justify-center top-3 z-50 w-full fixed">
    <div class="navbar bg-base-200 w-11/12 rounded-md">
      <div class="flex-1">
        <NuxtLink to="/" class="btn btn-ghost p-1">
          <NuxtImg src="/luak-logo.png" class="h-full" :quality="50" />
        </NuxtLink>
      </div>
      <div class="flex-none">
        <ul class="menu menu-horizontal px-1">
          <li><NuxtLink to="/news">News</NuxtLink></li>
          <li><NuxtLink to="/calendar">Calendar</NuxtLink></li>
          <li>
            <details>
              <summary>Info</summary>
              <ul class="p-2 bg-base-200 rounded-t-none">
                <li v-for="nav in info_navigation[0].children" :key="nav._path">
                  <NuxtLink :to="nav._path">{{ nav.title }}</NuxtLink>
                </li>
              </ul>
            </details>
          </li>
          <li><NuxtLink>Contact</NuxtLink></li>
        </ul>
      </div>
    </div>
  </div>
</template>
