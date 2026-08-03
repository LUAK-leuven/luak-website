<script setup lang="ts">
  import dayjs from 'dayjs';

  const NR_OF_ACTIVITIES = 20;
  const { data } = await useAsyncData('activities_page', () =>
    queryCollection('activities')
      .where('date', '>=', dayjs().startOf('day').toISOString())
      .order('date', 'ASC')
      .limit(NR_OF_ACTIVITIES)
      .all(),
  );
</script>

<template>
  <FullPageCard>
    <template #title> Activities </template>
    <div v-if="!data || data.length === 0" class="flex justify-center">
      <h2>Activities coming soon!</h2>
    </div>
    <div v-else class="flex flex-wrap justify-center">
      <ActivityItem
        v-for="newsItem in data"
        :key="newsItem.path"
        v-bind="{ data: newsItem }" />
    </div>
    <div class="divider my-5" />
    <GoogleCalendar />
  </FullPageCard>
</template>
