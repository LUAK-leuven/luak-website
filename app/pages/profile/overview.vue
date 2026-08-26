<script setup lang="ts">
  import ProfileCard from '~/components/profile/overview/Card.vue';
  import MembershipCard from '~/components/profile/overview/membership/MembershipCard.vue';
  import LogOutCard from '~/components/profile/overview/LogOutCard.vue';

  const { getUserInfo, getMembershipInfo } = useUserService();
  const membershipInfo = await getMembershipInfo();
  const user = await getUserInfo();

  const activeMembership = computed(() =>
    membershipInfo.value.getActiveMembership(),
  );
</script>
<template>
  <FullPageCard>
    <template #title> My Profile </template>
    <div v-if="!user" class="text-center">
      <p>Not logged in yet</p>
      <NuxtLink class="btn btn-primary" :to="{ name: 'login' }">
        Log in
      </NuxtLink>
    </div>
    <template v-else>
      <h2 data-testId="userName">
        Hi {{ user.firstName ?? 'LUAK member' }} 👋
      </h2>
      Welcome to your profile page. Here you can manage your membership! In the
      future more functionality will be added.
      <div class="my-5 mx-2 flex flex-wrap justify-evenly gap-x-4">
        <MembershipCard :membership="activeMembership" />

        <ProfileCard image="/IMG_20240410_125659.jpg">
          <template #title> Profile Settings 🔧 </template>
          <template #description>
            Change your password, phone number and other settings
          </template>
          <template #actions>
            <NuxtLink class="btn" :to="{ name: 'profile-settings' }">
              settings
            </NuxtLink>
          </template>
        </ProfileCard>

        <ProfileCard image="/20241102_134927[1].jpg">
          <template #title> My rentals ⚙️ </template>
          <template #description>
            View the status of your active rental(s)
          </template>
          <template #actions>
            <NuxtLink class="btn btn-accent" :to="{ name: 'profile-gear' }">
              my rentals
            </NuxtLink>
          </template>
        </ProfileCard>

        <LogOutCard />
      </div>
    </template>
  </FullPageCard>
</template>
