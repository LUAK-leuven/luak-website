<script setup lang="ts">
import type { Database } from "~/types/database.types";

const user = useSupabaseUser();

const supabase = useSupabaseClient<Database>();
const has_membership = ref(await getHasMembership());
const isBoardMember = ref(false);

// Check if user is a board member
const checkBoardMemberStatus = async () => {
  if (!user.value) return;

  const { data } = await supabase
    .from("BoardMembers")
    .select("*")
    .eq("user_id", user.value.id)
    .single();

  isBoardMember.value = !!data;
};

const { data: userData } = await useAsyncData("userData", async () => {
  if (!user.value) throw createError({ statusCode: 401 });
  const { data } = await supabase
    .from("Users")
    .select("*")
    .eq("id", user.value.id)
    .single();
  return data;
});

// Check board member status when component is mounted
onMounted(() => {
  checkBoardMemberStatus();
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
            <NuxtLink class="btn" to="/profile/settings"> settings </NuxtLink>
          </template>
        </UserCard>
        <!-- Board Member Card - Only visible to board members -->
        <UserCard v-if="isBoardMember" image="/IMG_20240410_125659.jpg">
          <template #title> Members Overview 👥 </template>
          <template #description>
            View and export all active club memberships
          </template>
          <template #actions>
            <NuxtLink
              class="btn btn-primary"
              to="/profile/subscriptions-overview"
            >
              View Members
            </NuxtLink>
          </template>
        </UserCard>
        <UserLogOutCard />
      </div>
    </template>
  </FullPageCard>
</template>
