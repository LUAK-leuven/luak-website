<script lang="ts" setup>
  import {
    getCurrentMembershipYear,
    type Membership,
  } from '~/model/Membership';
  import BuyMembershipCard from './BuyMembership/Card.vue';
  import ValidMembershipCard from './ValidMembershipCard.vue';
  import RenewMembershipCard from './RenewMembershipCard.vue';

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
