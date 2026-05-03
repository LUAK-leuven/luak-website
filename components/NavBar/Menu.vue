<script setup lang="ts">
  import { toggleCloseFix } from '~/utils/toggleCloseFix';

  const props = defineProps<{ id?: string }>();

  const { data: info_navigation } = await useAsyncData('info_navigation', () =>
    queryCollectionNavigation('info_'),
  );
  const { data: user } = await useLuakMember();

  const closeDrawer = () => {
    const drawerToggle = document.getElementById(
      'my-drawer-3',
    ) as HTMLInputElement | null;
    if (drawerToggle) {
      drawerToggle.checked = false;
    }
  };

  onMounted(() => {
    toggleCloseFix('info-toggle');
    toggleCloseFix('board-toggle');
    toggleCloseFix('member-toggle');

    if (props.id !== undefined) {
      // Fix drawer closing by closing drawer on click
      const links = document
        .getElementById(props.id)
        ?.getElementsByTagName('a');
      if (links) {
        for (const link of links) {
          link.addEventListener('click', closeDrawer);
        }
      }
    }
  });
</script>

<template>
  <ul :id="id" class="menu">
    <li>
      <NuxtLink to="/pages/about">About us</NuxtLink>
    </li>
    <li>
      <NuxtLink to="/activities">Activities</NuxtLink>
    </li>
    <li>
      <details id="info-toggle">
        <summary>Info</summary>
        <ul class="p-2 bg-base-200 rounded-t-none w-48">
          <li
            v-for="nav in info_navigation?.[0]?.children?.filter(
              (it) => it.title !== 'Contact',
            )"
            :key="nav.path">
            <NuxtLink :to="nav.path">{{ nav.title }}</NuxtLink>
          </li>
        </ul>
      </details>
    </li>
    <li v-if="!user.isMember">
      <NuxtLink to="/pages/become-a-member">Become a member</NuxtLink>
    </li>
    <li v-if="user.isMember">
      <details id="member-toggle">
        <summary>Member section</summary>
        <ul class="p-2 bg-base-200 rounded-t-none w-52">
          <li><NuxtLink to="/stories">Stories</NuxtLink></li>
          <li><NuxtLink to="/topos/library">Topo Library</NuxtLink></li>
          <li>
            <NuxtLink to="/pages/christmas-bets">Christmas Bets</NuxtLink>
          </li>
        </ul>
      </details>
    </li>
    <li v-if="user.isBoard">
      <details id="board-toggle">
        <summary>Board</summary>
        <ul class="p-2 bg-base-200 rounded-t-none w-52">
          <li>
            <NuxtLink to="/board/subscriptions-overview">
              👥 Members overview
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/board/rentals/form"> 🧗 Rental form </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/board/rentals"> 👀 Rental overview </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/board/gear"> ⚙️ Gear overview </NuxtLink>
          </li>
          <li>
            <a href="/_studio"> 📝 Studio Mode </a>
          </li>
        </ul>
      </details>
    </li>
    <li>
      <NuxtLink to="/pages/contact">Contact</NuxtLink>
    </li>
    <NuxtLink
      v-if="user.userInfo === undefined"
      class="btn btn-primary btn-outline"
      to="/profile/overview"
      data-testId="nav.login">
      Log In
    </NuxtLink>
    <NuxtLink
      v-else
      class="btn btn-primary btn-outline"
      to="/profile/overview"
      data-testId="nav.profile">
      My Profile
    </NuxtLink>
  </ul>
</template>
