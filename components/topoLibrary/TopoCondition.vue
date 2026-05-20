<script setup lang="ts">
  import type { Database } from '~/types/database.types';

  type TopoCondition =
    Database['public']['Tables']['Topos']['Row']['condition'];

  defineProps<{
    topoCondition: TopoCondition;
  }>();

  const conditionMap = (condition: TopoCondition) => {
    switch (condition) {
      case 'as_good_as_new':
        return 'New';
      case 'good':
        return 'Good';
      case 'used':
        return 'Used';
      case 'damaged':
      case 'falling_appart':
        return 'Damaged';
      default:
        return '-';
    }
  };
</script>
<template>
  <span
    class="badge"
    :class="{
      'badge-success':
        topoCondition === 'as_good_as_new' || topoCondition === 'good',
      'badge-warning': topoCondition === 'used',
      'badge-error': topoCondition === 'damaged',
    }">
    {{ conditionMap(topoCondition) }}
  </span>
</template>
