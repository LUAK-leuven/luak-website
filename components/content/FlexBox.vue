<script lang="ts" setup>
defineProps({
  justify: {
    type: String,
    default: "justify-center",
  },
});
</script>
<template>
  <div class="flex flex-wrap w-full items-center" :class="justify">
    <div v-if="$slots.item1" class="max-w-60 md:max-w-80 mx-2">
      <ContentSlot key="slot1" :use="$slots.item1" />
    </div>
    <div v-if="$slots.item2" class="max-w-60 md:max-w-80 mx-2">
      <ContentSlot key="slot2" :use="$slots.item2" />
    </div>
    <div v-if="$slots.item3" class="max-w-60 md:max-w-80 mx-2">
      <ContentSlot key="slot3" :use="$slots.item3" />
    </div>
    <div v-if="$slots.item4" class="max-w-60 md:max-w-80 mx-2">
      <ContentSlot key="slot4" :use="$slots.item4" />
    </div>
    <div v-if="$slots.item5" class="max-w-60 md:max-w-80 mx-2">
      <ContentSlot key="slot5" :use="$slots.item5" />
    </div>
    <div v-if="$slots.item6" class="max-w-60 md:max-w-80 mx-2">
      <ContentSlot key="slot6" :use="$slots.item6" />
    </div>
    <div v-if="$slots.item7" class="max-w-60 md:max-w-80 mx-2">
      <ContentSlot key="slot7" :use="$slots.item7" />
    </div>
    <div v-if="$slots.item8" class="max-w-60 md:max-w-80 mx-2">
      <ContentSlot key="slot8" :use="$slots.item8" />
    </div>
    <div v-if="$slots.item9" class="max-w-60 md:max-w-80 mx-2">
      <ContentSlot key="slot9" :use="$slots.item9" />
    </div>
    <div v-if="$slots.item10" class="max-w-60 md:max-w-80 mx-2">
      <ContentSlot key="slot10" :use="$slots.item10" />
    </div>
  </div>
</template>
