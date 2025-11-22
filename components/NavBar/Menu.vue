<script setup lang="ts">
  const { data: info_navigation } = await useAsyncData('info_navigation', () =>
    fetchContentNavigation(queryContent('/info')),
  );
  const { data: pages_navigation } = await useAsyncData(
    'pages_navigation',
    () => fetchContentNavigation(queryContent('/pages')),
  );
  const user = useSupabaseUser();

  const closeDrawer = () => {
    const drawerToggle = document.getElementById(
      'my-drawer-3',
    ) as HTMLInputElement;
    if (drawerToggle) {
      drawerToggle.checked = false;
    }
  };

  function closeInfo() {
    const infoToggle = document.getElementById(
      'info-toggle',
    ) as HTMLDetailsElement;
    if (infoToggle) {
      infoToggle.open = false;
    }
  }

  function infoToggleEventListener(event: Event) {
    if (event instanceof ToggleEvent) {
      if (event.newState === 'open') {
        window.addEventListener('click', closeInfo);
      } else {
        window.removeEventListener('click', closeInfo);
      }
    }
  }
</script>

<template>
  <ul class="menu">
    <li><NuxtLink to="/news" @click="closeDrawer">News</NuxtLink></li>
    <li>
      <NuxtLink to="/activities" @click="closeDrawer">Activities</NuxtLink>
    </li>
    <li>
      <details id="info-toggle" @toggle="infoToggleEventListener">
        <summary>Info</summary>
        <ul class="p-2 bg-base-200 rounded-t-none">
          <li v-for="nav in info_navigation?.[0]?.children" :key="nav._path">
            <NuxtLink :to="nav._path" @click="closeDrawer">{{
              nav.title
            }}</NuxtLink>
          </li>
        </ul>
      </details>
    </li>
    <li v-for="nav in pages_navigation?.[0]?.children" :key="nav._path">
      <NuxtLink :to="nav._path" @click="closeDrawer">{{ nav.title }}</NuxtLink>
    </li>
    <li v-if="user">
      <NuxtLink to="/stories" @click="closeDrawer">Stories</NuxtLink>
    </li>
    <NuxtLink
      v-if="!user"
      class="btn btn-primary btn-outline"
      to="/profile/overview"
      @click="closeDrawer"
      >Log In</NuxtLink
    >
    <NuxtLink
      v-else
      class="btn btn-primary btn-outline"
      to="/profile/overview"
      @click="closeDrawer"
      >My Profile</NuxtLink
    >
  </ul>
</template>
