<script setup lang="ts">
import type { ActivityContent } from "~/types/content.types";

const NR_OF_ACTIVITIES = 20;
const { data } = await useAsyncData(() =>
  queryContent<ActivityContent>("/activities")
    .sort({ date: 1 })
    .limit(NR_OF_ACTIVITIES)
    .find(),
);
</script>

<template>
  <FullPageCard>
    <template #title> Activities </template>
    <div class="flex flex-wrap justify-start">
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
