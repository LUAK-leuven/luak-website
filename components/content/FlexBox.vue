<template>
  <div class="flex flex-row justify around">
    <ContentSlot v-if="$slots.slot1" :use="$slots.slot1" />
    <ContentSlot v-if="$slots.slot2" :use="$slots.slot2" />
    <ContentSlot v-if="$slots.slot3" :use="$slots.slot3" />
    <ContentSlot v-if="$slots.slot4" :use="$slots.slot4" />
    <ContentSlot v-if="$slots.slot5" :use="$slots.slot5" />
    <ContentSlot v-if="$slots.slot6" :use="$slots.slot6" />
    <ContentSlot v-if="$slots.slot7" :use="$slots.slot7" />
    <ContentSlot v-if="$slots.slot8" :use="$slots.slot8" />
    <ContentSlot v-if="$slots.slot9" :use="$slots.slot9" />
    <ContentSlot v-if="$slots.slot10" :use="$slots.slot10" />
  </div>
</template>
