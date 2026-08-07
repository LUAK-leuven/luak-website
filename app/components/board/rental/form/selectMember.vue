<script setup lang="ts">
  import Text from '~/components/input/Text.vue';
  import type { MembershipStatus } from '~/model/Membership';
  import SelectMemberItem from './selectMemberItem/SelectMemberItem.vue';

  withDefaults(
    defineProps<{
      disable?: boolean;
      error?: string | undefined;
    }>(),
    {
      disable: false,
      error: undefined,
    },
  );

  const selectedUserId = defineModel<UserId | 'non-user' | undefined>('userId');
  const fullName = defineModel<string | undefined>('fullName');
  const email = defineModel<string | undefined>('email');
  const phone = defineModel<string | undefined>('phone');

  const { getAllUsers } = useUserService();
  const { data: users, pending } = await getAllUsers();

  export type SelectableUser = {
    name: string;
    id: UserId | 'non-user';
    membershipStatus: MembershipStatus;
  };
  const selectableUsers = computed(() =>
    (users.value ?? [])
      .map(
        (user) =>
          ({
            name: user.firstName + ' ' + user.lastName,
            id: user.id,
            membershipStatus: user.membershipStatus,
          }) satisfies SelectableUser as SelectableUser,
      )
      .concat({
        name: 'Add a non-member',
        id: 'non-user',
        membershipStatus: 'active',
      }),
  );

  const filterUser = (input: string | undefined) => {
    if (pending.value) return undefined;
    if (input === undefined) return selectableUsers.value;
    return selectableUsers.value.filter(
      (option) =>
        fuzzySearch(option.name, input) > 0 ||
        matchOnFirstLetters(option.name, input),
    );
  };

  const selectedUser = computed(() =>
    findBy(selectableUsers.value, 'id', selectedUserId.value),
  );

  const selectUser = (user: SelectableUser) => {
    selectedUserId.value = user.id;
  };
</script>

<template>
  <div class="flex flex-col">
    <InputSearchableSelect
      label="Member name *"
      placeholder="select member"
      :options-provider="filterUser"
      :error-message="error"
      :selected-item="selectedUser"
      loading-message="Loading users"
      :disable="disable"
      @on-select="selectUser">
      <template #item="{ data }">
        <SelectMemberItem
          class="px-3 py-1 rounded-md w-full min-w-max"
          :user="data" />
      </template>
    </InputSearchableSelect>
    <div v-if="selectedUserId === 'non-user'">
      <Text
        v-model="fullName"
        placeholder="Adam Ondra"
        label="Full name *"
        type="text"
        data-testId="contact.fullName" />
      <Text
        v-model="email"
        placeholder="example@mail.com"
        label="Email"
        type="email"
        data-testId="contact.email" />
      <Text
        v-model="phone"
        placeholder="+32 123 34 56 77"
        label="Phone number"
        type="text"
        data-testId="contact.phoneNumber" />
    </div>
  </div>
</template>
