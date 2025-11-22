<script setup lang="ts">
  const user = await useLuakMember();
</script>
<template>
  <FullPageCard>
    <template #title> My Profile </template>
    <span v-if="!user">Not logged in yet</span>
    <template v-else>
      <h2>Hi {{ user.userInfo?.first_name ?? 'LUAK member' }} 👋</h2>
      Welcome to your profile page. Here you can manage your membership! In the
      future more functionaity will be added.
      <div class="my-5 mx-2 flex flex-wrap justify-around">
        <UserBuyMembershipCard
          v-if="user.membershipType !== 'paid_membership'" />
        <UserMembershipCard v-else />
        <UserCard image="/IMG_20240410_125659.jpg">
          <template #title> Profile Settings 🔧 </template>
          <template #description>
            Change your password, phone number and other settings
          </template>
          <template #actions>
            <NuxtLink class="btn" to="/profile/settings"> settings </NuxtLink>
          </template>
        </UserCard>
        <!-- Board Member Card - Only visible to board members -->
        <UserCard v-if="user.isBoard" image="/IMG_20240410_125659.jpg">
          <template #title> Members Overview 👥 </template>
          <template #description>
            View and export all active club memberships
          </template>
          <template #actions>
            <NuxtLink
              class="btn btn-primary"
              to="/board/subscriptions-overview">
              View Members
            </NuxtLink>
          </template>
        </UserCard>
        <UserCard v-if="user.isBoard" image="/luak-logo.png">
          <template #title> Gear Rental 🧗 </template>
          <template #actions>
            <NuxtLink class="btn btn-primary" to="/board/rental">
              Go to Form
            </NuxtLink>
          </template>
        </UserCard>
        <UserLogOutCard />
      </div>
    </template>
  </FullPageCard>
</template>
