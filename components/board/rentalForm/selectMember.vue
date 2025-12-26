<script setup lang="ts">
  const props = withDefaults(defineProps<{ name?: string }>(), {
    name: 'member',
  });

  const users = await userService().getAllUsers();
  const selectableUsers = users.map((user) => ({
    name: user.first_name + ' ' + user.last_name,
    id: user.id,
    hasPaid: user.paid_membership,
  }));
  selectableUsers.push({
    name: 'Add a non-member',
    id: '',
    hasPaid: true,
  });

  function filterMember(
    options: typeof selectableUsers,
    input: string | undefined,
  ) {
    if (input === undefined) return options;
    return options
      .filter((option) =>
        option.name.toLowerCase().includes(input.toLowerCase()),
      )
      .slice(0, 5);
  }

  const { value, errorMessage } = useField<string | undefined>(
    () => props.name,
  );

  const selectedUser = computed(() =>
    selectableUsers.find((user) => user.id === value.value),
  );
  function onSelect(selectedMember: {
    id: string;
    name: string;
    hasPaid: boolean;
  }) {
    value.value = selectedMember.id;
  }
</script>

<template>
  <div class="flex flex-col">
    <InputTextOptionsSelect
      label="Member name *"
      :options="selectableUsers"
      placeholder="select member"
      :search-fn="filterMember"
      :error-message="errorMessage"
      :selected-item="selectedUser"
      @selected="onSelect">
      <template #item="{ data }">
        <div
          class="px-3 py-1 rounded-md w-full min-w-max"
          :class="
            data.id === ''
              ? 'bg-blue-100'
              : data.hasPaid
                ? 'bg-green-100'
                : 'bg-red-100'
          ">
          {{ data.hasPaid ? '' : '⚠️ ' }}{{ data.name }}
        </div>
      </template>
    </InputTextOptionsSelect>
    <div v-if="value === ''">
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
