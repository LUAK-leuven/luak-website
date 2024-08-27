<script setup lang="ts">
import type { Database } from "~/types/database.types";

const user = useSupabaseUser();

const supabase = useSupabaseClient<Database>();
const has_membership = ref(await getHasMembership());

const { data: userData } = await useAsyncData("userData", async () => {
  if (!user.value) throw createError({ statusCode: 401 });
  const { data } = await supabase
    .from("Users")
    .select("*")
    .eq("id", user.value.id)
    .single();
  return data;
});
</script>
<template>
  <FullPageCard>
    <template #title> My Profile </template>
    <span v-if="!user">Not logged in yet</span>
    <template v-else>
      <h2>Hi {{ userData?.first_name ?? "LUAK member" }} 👋</h2>
      Welcome to your profile page. Here you can manage your membership! In the
      future more functionaity will be added.
      <div class="my-5 mx-2 flex flex-wrap justify-around">
        <UserBuyMembershipCard v-if="has_membership !== 'paid_membership'" />
        <UserMembershipCard v-else />
        <UserCard image="/IMG_20240410_125659.jpg">
          <template #title> Profile Settings 🔧 </template>
          <template #description>
            Change your password, phone number and other settings
          </template>
          <template #actions>
            <NuxtLink to="/profile/settings" class="btn"> settings </NuxtLink>
          </template>
        </UserCard>
        <UserLogOutCard />
      </div>
    </template>
  </FullPageCard>
</template>
