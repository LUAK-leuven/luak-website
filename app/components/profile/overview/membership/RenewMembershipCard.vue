<script setup lang="ts">
  import ProfileCard from '~/components/profile/overview/Card.vue';
  import BuyMembershipModal from '~/components/profile/overview/membership/BuyMembership/Modal.vue';
  import type { Membership } from '~/model/Membership';
  import { formatMembershipYear } from '~/utils/membershipYear';

  defineProps<{
    membership: Membership;
    currentMembershipYear: number;
  }>();
</script>
<template>
  <ProfileCard image="/aiguilles_rouges.jpg">
    <template #title>
      ♻️ Renew your membership for
      {{ formatMembershipYear(currentMembershipYear, 'long') }}
    </template>
    <template #description>
      ✅ You still have an active membership for
      {{ formatMembershipYear(membership.membershipYear, 'long') }}, but it will
      expire soon.
    </template>
    <template #actions>
      <BuyMembershipModal />
    </template>
  </ProfileCard>
</template>
