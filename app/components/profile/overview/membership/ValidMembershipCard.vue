<script setup lang="ts">
  import type { Membership } from '~/model/Membership';
  import { formatMembershipYear } from '~/utils/membershipYear';
  import ProfileCard from '~/components/profile/overview/Card.vue';

  defineProps<{
    membership: Membership;
  }>();
</script>
<template>
  <ProfileCard image="/aiguilles_rouges.jpg" data-testId="hasMembershipCard">
    <template #title>
      You have a valid membership for
      {{ formatMembershipYear(membership.membershipYear, 'short') }}
      ✅
    </template>
    <template #description>
      🎉 Congratulations! You're all set for the upcoming academic year.
    </template>
  </ProfileCard>
</template>
