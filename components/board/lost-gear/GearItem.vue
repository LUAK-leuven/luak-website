<script setup lang="ts">
  import type { GearItemId } from '~/types/gear';

  defineProps<{
    gearItemId: GearItemId;
  }>();
</script>
<template>{{ gearItemId }} - Not yet implemented</template>
