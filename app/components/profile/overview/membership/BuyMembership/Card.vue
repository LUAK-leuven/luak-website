<script setup lang="ts">
  import ActionCard from '~/components/ActionCard.vue';
  import BuyMembershipModal from '~/components/profile/overview/membership/BuyMembership/Modal.vue';

  defineProps<{
    currentMembershipYear: number;
  }>();
</script>
<template>
  <ActionCard image="/aiguilles_rouges.jpg" data-testId="buyMembershipCard">
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
  </ActionCard>
</template>
