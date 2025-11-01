<script setup lang="ts"></script>
<template>
  <FullPageCard>
    <template #title> Profile settings </template>
    <NuxtLink class="btn btn-circle btn-sm btn-outline" to="/profile/overview">
      <span class="material-symbols-outlined"> arrow_back</span>
    </NuxtLink>
    <UserUpdatePassword />
    <div class="divider" />
    <UserUpdateInfo />
  </FullPageCard>
</template>
