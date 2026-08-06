<script setup lang="ts">
  import UpdateInfo from '~/components/profile/overview/Update/Info.vue';
  import UpdatePassword from '~/components/profile/overview/Update/Password.vue';
  import BackButton from '~/components/shared/BackButton.vue';
</script>
<template>
  <FullPageCard>
    <template #title> Profile settings </template>
    <BackButton :to="{ name: 'profile-overview' }" />
    <UpdatePassword />
    <div class="divider" />
    <UpdateInfo />
  </FullPageCard>
</template>
