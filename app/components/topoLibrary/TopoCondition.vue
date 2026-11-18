<script setup lang="ts">
  import { TopoCondition } from '#shared/api/rest/topo';

  defineProps<{
    topoCondition: TopoCondition;
  }>();

  const conditionMap = (condition: TopoCondition) => {
    switch (condition) {
      case TopoCondition.asGoodAsNew:
        return 'New';
      case TopoCondition.good:
        return 'Good';
      case TopoCondition.used:
        return 'Used';
      case TopoCondition.damaged:
      case TopoCondition.fallingApart:
        return 'Damaged';
      case undefined:
        return '-';
      default:
        console.warn(`Unhandled topo condition: ${condition}`);
        return '-';
    }
  };
</script>
<template>
  <span
    class="badge"
    :class="{
      'badge-success':
        topoCondition === TopoCondition.asGoodAsNew ||
        topoCondition === TopoCondition.good,
      'badge-warning': topoCondition === 'used',
      'badge-error': topoCondition === 'damaged',
    }">
    {{ conditionMap(topoCondition) }}
  </span>
</template>
