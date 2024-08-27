<script setup lang="ts">
const { data: info_navigation } = await useAsyncData("info_navigation", () =>
  fetchContentNavigation(queryContent("/info")),
);
const user = useSupabaseUser();
</script>
<template>
  <ul class="menu">
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
