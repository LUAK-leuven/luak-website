<script setup lang="ts">
  import type { Membership } from '~/model/Membership';

  const props = defineProps<{
    membership: Membership;
  }>();

  const membershipYear = computed(
    () =>
      `${(props.membership.membershipYear - 2000).toFixed()}-${(
        props.membership.membershipYear -
        2000 +
        1
      ).toFixed()}`,
  );
</script>
<template>
  <UserCard image="/aiguilles_rouges.jpg">
    <template #title>
      You have a valid membership for {{ membershipYear }}
      ✅
    </template>
    <template #description>
      🎉 Congratulations! You're all set for the upcoming academic year.
    </template>
  </UserCard>
</template>
