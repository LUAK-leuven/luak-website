<script lang="ts" setup>
  defineProps({
    justify: {
      type: String,
      default: 'justify-center',
    },
  });
</script>

<template>
  <div class="flex flex-wrap w-full items-center" :class="justify">
    <div v-if="$slots.item1" class="max-w-60 md:max-w-80 mx-2">
      <slot name="item1" />
    </div>
    <div v-if="$slots.item2" class="max-w-60 md:max-w-80 mx-2">
      <slot name="item2" />
    </div>
    <div v-if="$slots.item3" class="max-w-60 md:max-w-80 mx-2">
      <slot name="item3" />
    </div>
    <div v-if="$slots.item4" class="max-w-60 md:max-w-80 mx-2">
      <slot name="item4" />
    </div>
    <div v-if="$slots.item5" class="max-w-60 md:max-w-80 mx-2">
      <slot name="item5" />
    </div>
    <div v-if="$slots.item6" class="max-w-60 md:max-w-80 mx-2">
      <slot key="item6" />
    </div>
    <div v-if="$slots.item7" class="max-w-60 md:max-w-80 mx-2">
      <slot name="item7" />
    </div>
    <div v-if="$slots.item8" class="max-w-60 md:max-w-80 mx-2">
      <slot name="item8" />
    </div>
    <div v-if="$slots.item9" class="max-w-60 md:max-w-80 mx-2">
      <slot name="item9" />
    </div>
    <div v-if="$slots.item10" class="max-w-60 md:max-w-80 mx-2">
      <slot name="item10" />
    </div>
  </div>
</template>
