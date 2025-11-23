<script setup lang="ts">
  const props = withDefaults(defineProps<{ name?: string }>(), {
    name: 'member',
  });

  const users = await userService().getAllUsers();
  const selectableUsers =
    users?.map((user) => ({
      name: user.first_name + ' ' + user.last_name,
      id: user.id,
      hasPaid: user.paid_membership,
    })) ?? [];

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

  const selectedMember = ref<{ id: string; name: string; hasPaid: boolean }>();

  const { value, errorMessage } = useField<string | undefined>(
    () => props.name,
  );
  effect(() => {
    value.value = selectedMember.value?.id;
  });
</script>

<template>
  <InputTextOptionsSelect
    v-model="selectedMember"
    label="Member name *"
    :options="selectableUsers"
    placeholder="select member"
    :options-select-fn="filterMember"
    :show-selected-item="true"
    :error-message="errorMessage">
    <template #item="{ data }">
      <div
        class="px-3 py-1 rounded-md"
        :class="data.hasPaid ? 'bg-green-100' : 'bg-red-100'">
        {{ data.hasPaid ? '' : '⚠️ ' }}{{ data.name }}
      </div>
    </template>
  </InputTextOptionsSelect>
</template>
