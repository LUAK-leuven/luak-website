<script setup lang="ts">
  import dayjs from 'dayjs';
  import * as yup from 'yup';
  import type { Database } from '~/types/database.types';

  const user = useSupabaseUser();
  const supabase = useSupabaseClient<Database>();
  const { error } = await checkIsBoardMember();
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

  const users = await getUserInfo();
  const selectableUsers =
    users?.map((user) => ({
      label: user.first_name + ' ' + user.last_name,
      value: { id: user.id, hasPaid: user.paid_membership },
    })) ?? [];

  const gear = await getAvailableGear();
  console.log('gear', gear);

  const formSchema = yup.object({
    boardMember: yup.string().required(),
    member: yup
      .mixed<(typeof selectableUsers)[number]['value']>()
      .required('You must select a member')
      .label('member'),
    date_borrow: yup.string().required(),
    date_return: yup.string().required(),
  });
  const initialValues = {
    boardMember: userData.value.first_name + ' ' + userData.value.last_name,
    date_borrow: dayjs().format('YYYY-MM-DD').toString(),
    date_return: dayjs().add(3, 'w').format('YYYY-MM-DD').toString(),
  };

  const { values, errors, meta, defineField } = useForm({
    validationSchema: toTypedSchema(formSchema),
    initialValues: initialValues,
  });
  const [member] = defineField('member');
</script>

<template>
  <FullPageCard>
    <template #title>Rental form 🧗</template>

    <!-- Error message -->
    <div v-if="error" class="alert alert-error">
      <span>{{ error }}</span>
    </div>

    <div v-else class="grid grid-cols-2 gap-x-10 gap-y-2 mb-3">
      <div class="w-full">
        <InputTextOptionsSelect
          v-model="member"
          label="Member *"
          :options="selectableUsers"
          placeholder="select member"
          :error="errors.member" />

        <div
          v-if="!(values.member?.hasPaid ?? true)"
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
    <hr />
    <div>
      <h2>Gear</h2>
      <InputTextOptionsSelect
        :options="[
          { label: '1', value: 1 },
          { label: '2', value: 2 },
        ]" />
    </div>

    {{ values }}

    <button
      class="btn btn-primary mt-2 w-fit"
      :class="{ 'btn-disabled': !meta.valid || !meta.dirty }">
      Submit
    </button>
  </FullPageCard>
</template>
