<script setup lang="ts">
  import dayjs from 'dayjs';
  import type { ItemEvent } from '~~/server/domain/inventory/ItemEvent';

  defineProps<{
    events: (ItemEvent & { occurredOn: string })[];
    purchaseDate: string;
    initialAmount: number;
  }>();

  const formatDate = (date: string) => {
    return dayjs(date).format('DD-MM-YYYY');
  };
</script>
<template>
  <ul class="ml-5">
    <li>
      <div class="flex flex-row flex-wrap gap-x-1">
        {{ purchaseDate }}: Bought {{ initialAmount }} item(s)
      </div>
    </li>
    <li v-for="(event, idx) of events" :key="idx">
      <div class="flex flex-row flex-wrap gap-x-1">
        {{ formatDate(event.occurredOn) }}:
        <template v-if="event.eventName === 'ItemLostEvent'">
          <span v-if="event.rentalId === undefined" data-testid="lostItem">
            {{ event.lostAmount }} item(s) lost without rental
          </span>
          <SharedLinkTo
            v-else
            :text="`${event.lostAmount} item(s) lost`"
            :to="{
              name: 'board-rentals-id',
              params: { id: event.rentalId },
            }" />
        </template>
        <span v-else-if="event.eventName === 'ItemArchivedEvent'">
          {{ event.amount }} item(s) archived
        </span>
      </div>
    </li>
  </ul>
</template>
