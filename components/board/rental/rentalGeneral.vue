<script setup lang="ts">
  import * as yup from 'yup';
  import dayjs from 'dayjs';
  import type { Database } from '~/types/database.types';

  const user = useSupabaseUser();
  const supabase = useSupabaseClient<Database>();

  const model = defineModel<
    Partial<{
      boardMember: string;
      member: string;
      dateBorrowed: string;
      dateReturn: string;
    }>
  >({
    required: true,
  });

  const { data: userData } = await useAsyncData('userData', async () => {
    if (!user.value) throw createError({ statusCode: 401 });

    const { data } = await supabase
      .from('Users')
      .select('*')
      .eq('id', user.value.id)
      .single();
    return data;
  });
  if (!userData.value) throw new Error('Failed to load User data.');

  model.value.boardMember = userData.value.id;

  const users = await getUserInfo();
  const selectableUsers =
    users?.map((user) => ({
      name: user.first_name + ' ' + user.last_name,
      id: user.id,
      hasPaid: user.paid_membership,
    })) ?? [];

  const formSchema = yup.object({
    boardMember: yup.string().required(),
    member: yup.mixed<(typeof selectableUsers)[number]>().required(),
    date_borrow: yup.string().required(),
    date_return: yup.string().required(),
  });
  const initialValues = {
    boardMember: userData.value.first_name + ' ' + userData.value.last_name,
    date_borrow: dayjs().format('YYYY-MM-DD').toString(),
    date_return: dayjs().add(3, 'w').format('YYYY-MM-DD').toString(),
  };

  const { values, defineField } = useForm({
    validationSchema: toTypedSchema(formSchema),
    initialValues: initialValues,
  });

  const [memberField] = defineField('member');
  const member = ref<(typeof selectableUsers)[number]>();
  effect(() => {
    memberField.value = member.value;
    model.value.member = values.member?.id;
    model.value.dateBorrowed = values.date_borrow;
    model.value.dateReturn = values.date_return;
  });

  function filterMember(
    options: typeof selectableUsers,
    input: string | undefined,
  ) {
    if (input === undefined) return options;
    return options.filter((option) => option.name.includes(input));
  }
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-2 mb-3">
    <div class="w-full self-end">
      <InputTextOptionsSelect
        v-model="member"
        :options="selectableUsers"
        placeholder="select member"
        :options-select-fn="filterMember"
        :show-selected-item="true">
        <template #item="{ data }">
          <div
            class="px-3 py-1 rounded-md"
            :class="data.hasPaid ? 'bg-green-100' : 'bg-red-100'">
            {{ data.hasPaid ? '' : '⚠️ ' }}{{ data.name }}
          </div>
        </template>
      </InputTextOptionsSelect>

      <div
        v-if="!(member?.hasPaid ?? true)"
        class="bg-yellow-300 rounded-md w-fit px-1">
        Warning: user has no active membership!
      </div>
    </div>

    <InputText
      class="w-full"
      label="Board member *"
      name="boardMember"
      :disabled="true" />

    <InputText label="Date borrow *" name="date_borrow" type="date" />
    <InputText label="Date return *" name="date_return" type="date" />
  </div>
</template>
