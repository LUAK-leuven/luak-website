<script lang="ts" setup>
  import BuyMembershipCard from '~/components/profile/overview/membership/BuyMembership/Card.vue';
  import RenewMembershipCard from '~/components/profile/overview/membership/RenewMembershipCard.vue';
  import ValidMembershipCard from '~/components/profile/overview/membership/ValidMembershipCard.vue';
  import {
    getCurrentMembershipYear,
    type Membership,
  } from '~/model/Membership';

  defineProps<{
    membership: Membership | undefined;
  }>();

  const currentMembershipYear = getCurrentMembershipYear();
</script>
<template>
  <BuyMembershipCard
    v-if="membership === undefined"
    :current-membership-year="currentMembershipYear" />
  <ValidMembershipCard
    v-else-if="membership.membershipYear === currentMembershipYear"
    :membership="membership" />
  <RenewMembershipCard
    v-else
    :membership="membership"
    :current-membership-year="currentMembershipYear" />
</template>
