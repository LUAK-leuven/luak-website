<script lang="ts" setup>
  import type { SelectableUser } from '../selectMember.vue';
  import ActiveMembership from './ActiveMembership.vue';
  import MembershipWillExpireSoon from './MembershipWillExpireSoon.vue';
  import NoMembership from './NoMembership.vue';
  import NonMember from './NonMember.vue';

  defineProps<{
    user: SelectableUser;
  }>();
</script>
<template>
  <NonMember v-if="user.id === 'non-user'" :name="user.name" />
  <ActiveMembership
    v-else-if="user.membershipStatus === 'active'"
    :name="user.name" />
  <MembershipWillExpireSoon
    v-else-if="user.membershipStatus === 'willExpire'"
    :name="user.name" />
  <NoMembership
    v-else-if="user.membershipStatus === 'inactive'"
    :name="user.name" />
  <div v-else>❗️ {{ user.name }}</div>
</template>
