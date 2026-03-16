<script setup lang="ts">
  import type { UserId } from '~/types/user';

  withDefaults(
    defineProps<{
      disable?: boolean;
      errorMessage?: string;
    }>(),
    {
      disable: false,
      errorMessage: undefined,
    },
  );

  const model = defineModel<UserId | 'non-user' | undefined>();

  const users = await userService().getAllUsers();
  type SelectableUser = {
    name: string;
    id: UserId | 'non-user';
    hasPaid: boolean;
  };
  const selectableUsers = computed(() =>
    users.data.value
      ?.map(
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

  function filterUser(input: string | undefined) {
    if (input === undefined) return selectableUsers.value;
    return selectableUsers.value?.filter(
      (option) =>
        fuzzySearch(option.name, input) > 0 ||
        matchOnFirstLetters(option.name, input),
    );
  }

  const selectedUser = computed(() =>
    findBy(selectableUsers.value, 'id', model.value),
  );
  function onSelect(selectedUser: {
    id: UserId | 'non-user';
    name: string;
    hasPaid: boolean;
  }) {
    model.value = selectedUser.id;
  }
</script>

<template>
  <div class="flex flex-col">
    <InputSearchableSelect
      label="Member name *"
      placeholder="select member"
      :options-provider="filterUser"
      :error-message="errorMessage"
      :selected-item="selectedUser"
      loading-message="Loading users"
      :disable="disable"
      @on-select="onSelect">
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
    <div v-if="model === 'non-user'">
      <InputText
        name="contactInfo.fullName"
        placeholder="Adam Ondra"
        label="Full name *"
        type="text" />
      <InputText
        name="contactInfo.email"
        placeholder="example@mail.com"
        label="Email"
        type="email" />
      <InputText
        name="contactInfo.phone"
        placeholder="+32 123 34 56 77"
        label="Phone number"
        type="text" />
    </div>
  </div>
</template>
