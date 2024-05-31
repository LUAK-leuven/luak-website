<script setup lang="ts"></script>
<template>
  <div class="card w-96 bg-base-100 shadow-xl image-full">
    <figure>
      <NuxtImg src="/IMG_20240410_125659.jpg" />
    </figure>
    <div class="card-body">
      <h2 class="card-title">Not yet a member for 2024 😢</h2>
      <p>
        Take part in our activities and enjoy the benefits of being a member.
      </p>
      <div class="card-actions justify-end">
        <UserBuyMembershipModal />
      </div>
    </div>
  </div>
</template>
