<script lang="ts" setup>
  import type { SelectableUser } from '~/components/board/rental/form/selectMember.vue';
  import ActiveMembership from '~/components/board/rental/form/selectMemberItem/ActiveMembership.vue';
  import MembershipWillExpireSoon from '~/components/board/rental/form/selectMemberItem/MembershipWillExpireSoon.vue';
  import NoMembership from '~/components/board/rental/form/selectMemberItem/NoMembership.vue';
  import NonMember from '~/components/board/rental/form/selectMemberItem/NonMember.vue';

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
