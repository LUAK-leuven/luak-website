<script setup lang="ts">
  const activeRentals = ref<PublicRentalDetails[]>();
  const returnedRentals = ref<PublicRentalDetails[]>();
  const loading = ref(true);
  const loadingReturned = ref(true);
  const showReturned = ref(false);

  const user = await useLuakMember();

  onMounted(async () => {
    if (user.userInfo && user.isMember) {
      activeRentals.value = await gearService().getActiveRentalsForUser(
        user.userInfo.id,
      );
    }
    loading.value = false;
  });

  async function onShowReturned() {
    showReturned.value = true;
    if (returnedRentals.value === undefined) {
      if (user.userInfo && user.isMember) {
        console.log('fetch');
        returnedRentals.value = await gearService().getReturnedRentalsForUser(
          user.userInfo.id,
        );
      }
    }
    loadingReturned.value = false;
  }
</script>
<template>
  <FullPageCard>
    <template #title>my gear</template>
    <template #subtitle>
      <h2>Overview of {{ user.userInfo?.first_name }}'s rentals</h2>
    </template>
    <div class="h-4"></div>
    <div v-if="loading" class="flex justify-center">
      <span class="loading loading-spinner loading-lg" />
    </div>
    <div v-else-if="activeRentals === undefined">ERROR!</div>
    <div v-else class="flex flex-col gap-2">
      <div v-if="activeRentals.length === 0">
        <span>You have currently no active rentals</span>
      </div>
      <BoardRentalDetailsOverview
        v-for="rental of activeRentals"
        :key="rental.id"
        :rental="rental" />

      <div class="flex flex-row justify-center">
        <button
          v-if="!showReturned"
          class="btn btn-primary btn-outline"
          @click="onShowReturned()">
          ↧ show past rentals ↧
        </button>
        <button
          v-else
          class="btn btn-primary btn-outline"
          @click="showReturned = false">
          ↥ hide past rentals ↥
        </button>
      </div>
      <template v-if="showReturned">
        <!-- TODO: fix spinner position not in center (for some reason styles fail to apply or I'm missing something here ...) -->
        <div v-if="loadingReturned" class="felx flex-row justify-center">
          <span class="loading loading-spinner loading-lg" />
        </div>
        <div v-else-if="returnedRentals === undefined">
          <span>Error</span>
        </div>
        <div v-else>
          <div v-if="returnedRentals.length === 0">
            <span>You have no past rentals</span>
          </div>
          <template v-for="rental of returnedRentals" :key="rental.id">
            <BoardRentalDetailsOverview :rental="rental" />
          </template>
        </div>
      </template>
    </div>
  </FullPageCard>
</template>
