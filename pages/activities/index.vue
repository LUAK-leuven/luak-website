<script setup lang="ts">
import dayjs from "dayjs";
import type { ActivityContent } from "~/types/content.types";

const NR_OF_ACTIVITIES = 20;
const { data } = await useAsyncData(() =>
  queryContent<ActivityContent>("/activities")
    .where({ date: { $gte: dayjs().startOf("day").toISOString() } })
    .sort({ date: 1 })
    .limit(NR_OF_ACTIVITIES)
    .find(),
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
        :key="newsItem._path"
        v-bind="{ data: newsItem }"
      />
    </div>
    <div class="divider my-5" />
    <GoogleCalendar />
  </FullPageCard>
</template>
