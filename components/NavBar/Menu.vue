<script setup lang="ts">
const { data: info_navigation } = await useAsyncData("info_navigation", () =>
  fetchContentNavigation(queryContent("/info")),
);
const { data: pages_navigation } = await useAsyncData("pages_navigation", () =>
  fetchContentNavigation(queryContent("/pages")),
);
const user = useSupabaseUser();
</script>
<template>
  <ul class="menu">
    <li><NuxtLink to="/news">News</NuxtLink></li>
    <li><NuxtLink to="/activities">Activities</NuxtLink></li>
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
    <li v-for="nav in pages_navigation[0].children" :key="nav._path">
      <NuxtLink :to="nav._path">{{ nav.title }}</NuxtLink>
    </li>
    <li v-if="user"><NuxtLink to="/stories">Stories</NuxtLink></li>
    <NuxtLink
      v-if="!user"
      to="/profile/overview"
      class="btn btn-primary btn-outline"
      >Log In</NuxtLink
    >
    <NuxtLink v-else to="/profile/overview" class="btn btn-primary btn-outline"
      >My Profile</NuxtLink
    >
  </ul>
</template>
