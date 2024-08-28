<script lang="ts" setup>
defineProps({
  justify: {
    type: String,
    default: "justify-center",
  },
});
</script>
<template>
  <div class="flex flex-wrap w-full" :class="justify">
    <div v-if="$slots.item1">
      <ContentSlot key="slot1" :use="$slots.item1" />
    </div>
    <div v-if="$slots.item2">
      <ContentSlot key="slot2" :use="$slots.item2" />
    </div>
    <div v-if="$slots.item3">
      <ContentSlot key="slot3" :use="$slots.item3" />
    </div>
    <div v-if="$slots.item4">
      <ContentSlot key="slot4" :use="$slots.item4" />
    </div>
    <div v-if="$slots.item5">
      <ContentSlot key="slot5" :use="$slots.item5" />
    </div>
    <div v-if="$slots.item6">
      <ContentSlot key="slot6" :use="$slots.item6" />
    </div>
    <div v-if="$slots.item7">
      <ContentSlot key="slot7" :use="$slots.item7" />
    </div>
    <div v-if="$slots.item8">
      <ContentSlot key="slot8" :use="$slots.item8" />
    </div>
    <div v-if="$slots.item9">
      <ContentSlot key="slot9" :use="$slots.item9" />
    </div>
    <div v-if="$slots.item10">
      <ContentSlot key="slot10" :use="$slots.item10" />
    </div>
  </div>
</template>
