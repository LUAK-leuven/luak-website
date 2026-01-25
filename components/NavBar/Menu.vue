<script setup lang="ts">
  const { data: info_navigation } = await useAsyncData('info_navigation', () =>
    queryCollectionNavigation('info_'),
  );
  const { data: pages_navigation } = await useAsyncData(
    'pages_navigation',
    () => queryCollectionNavigation('pages'),
  );
  const user = await useLuakMember();

  const closeDrawer = () => {
    const drawerToggle = document.getElementById(
      'my-drawer-3',
    ) as HTMLInputElement;
    if (drawerToggle) {
      drawerToggle.checked = false;
    }
  };

  onMounted(() => {
    useToggleCloseFix('info-toggle');
    useToggleCloseFix('board-toggle');

    // Fix drawer closing by closing drawer on click
    const links = document
      .getElementById('luak_menu')
      ?.getElementsByTagName('a');
    if (links) {
      for (const link of links) {
        link.addEventListener('click', closeDrawer);
      }
    }
  });
</script>

<template>
  <ul id="luak_menu" class="menu">
    <li><NuxtLink to="/news">News</NuxtLink></li>
    <li>
      <NuxtLink to="/activities">Activities</NuxtLink>
    </li>
    <li>
      <details id="info-toggle">
        <summary>Info</summary>
        <ul class="p-2 bg-base-200 rounded-t-none">
          <li v-for="nav in info_navigation?.[0]?.children" :key="nav.path">
            <NuxtLink :to="nav.path">{{ nav.title }}</NuxtLink>
          </li>
        </ul>
      </details>
    </li>
    <li v-for="nav in pages_navigation?.[0]?.children" :key="nav.path">
      <NuxtLink :to="nav.path">{{ nav.title }}</NuxtLink>
    </li>
    <li v-if="user.isMember">
      <NuxtLink to="/stories">Stories</NuxtLink>
    </li>
    <li v-if="user.isBoard">
      <details id="board-toggle">
        <summary>Board</summary>
        <ul class="p-2 bg-base-200 rounded-t-none w-52">
          <li>
            <NuxtLink to="/board/subscriptions-overview">
              👥 Subscriptions
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/board/rental-form"> 🧗 Rental form </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/board/rentals"> 👀 Rental overview </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/board/gear-overview"> ⚙️ Gear overview </NuxtLink>
          </li>
          <li>
            <a href="/_studio"> ✏️ Edit Content </a>
          </li>
        </ul>
      </details>
    </li>
    <NuxtLink
      v-if="user.userInfo === undefined"
      class="btn btn-primary btn-outline"
      to="/profile/overview">
      Log In
    </NuxtLink>
    <NuxtLink v-else class="btn btn-primary btn-outline" to="/profile/overview">
      My Profile
    </NuxtLink>
  </ul>
</template>
