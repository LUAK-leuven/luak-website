<script setup lang="ts">
  import type { UserId } from '~/types/user';
  import Text from '~/components/input/Text.vue';

  withDefaults(
    defineProps<{
      disable?: boolean;
      error?: string;
    }>(),
    {
      disable: false,
      error: undefined,
    },
  );

  const selectedUserId = defineModel<UserId | 'non-user' | undefined>('userId');
  const fullName = defineModel<string>('fullName');
  const email = defineModel<string>('email');
  const phone = defineModel<string>('phone');

  const { data: users, pending } = await userService().getAllUsers();
  type SelectableUser = {
    name: string;
    id: UserId | 'non-user';
    hasPaid: boolean;
  };
  const selectableUsers = computed(() =>
    (users.value ?? [])
      .map(
        (user) =>
          ({
            name: user.first_name + ' ' + user.last_name,
            id: user.id,
            hasPaid: user.paid_membership,
          }) satisfies SelectableUser as SelectableUser,
      )
      .concat({
        name: 'Add a non-member',
        id: 'non-user',
        hasPaid: true,
      }),
  );

  const filterUser = (input: string | undefined) => {
    if (pending.value) return undefined;
    if (input === undefined) return selectableUsers.value;
    return selectableUsers.value?.filter(
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
        <div
          class="px-3 py-1 rounded-md w-full min-w-max"
          :class="
            data.id === 'non-user'
              ? 'bg-blue-100'
              : data.hasPaid
                ? 'bg-green-100'
                : 'bg-red-100'
          ">
          {{ data.hasPaid ? '' : '⚠️ ' }}{{ data.name }}
        </div>
      </template>
    </InputSearchableSelect>
    <div v-if="selectedUserId === 'non-user'">
      <Text
        v-model="fullName"
        placeholder="Adam Ondra"
        label="Full name *"
        type="text" />
      <Text
        v-model="email"
        placeholder="example@mail.com"
        label="Email"
        type="email" />
      <Text
        v-model="phone"
        placeholder="+32 123 34 56 77"
        label="Phone number"
        type="text" />
    </div>
  </div>
</template>
