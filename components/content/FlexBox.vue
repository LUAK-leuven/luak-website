<template>
  <!-- Work in progress -->
  <div class="flex flex-row justify around">
    <div v-for="(slot, name, index) in $slots" :key="index">
      {{ name }}
      <ContentSlot :use="$slots[name]" unwrap="div" />
    </div>
  </div>
</template>
