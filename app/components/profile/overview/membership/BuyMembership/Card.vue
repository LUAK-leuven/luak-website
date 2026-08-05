<script setup lang="ts">
  import BuyMembershipModal from './Modal.vue';
  import ProfileCard from '~/components/profile/overview/Card.vue';

  defineProps<{
    currentMembershipYear: number;
  }>();
</script>
<template>
  <ProfileCard image="/aiguilles_rouges.jpg">
    <template #title>
      Not yet a member for
      {{ formatMembershipYear(currentMembershipYear, 'long') }} 😢
    </template>
    <template #description>
      Take part in our activities and enjoy the benefits of being a member.
    </template>
    <template #actions>
      <BuyMembershipModal />
    </template>
  </ProfileCard>
</template>
