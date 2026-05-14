<script setup lang="ts">
  import type { TopoId } from '~/types/gear';

  defineProps<{
    topoId: TopoId;
  }>();
</script>
<template>heyyy - {{ topoId }}</template>
