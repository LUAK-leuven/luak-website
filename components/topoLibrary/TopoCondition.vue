<script setup lang="ts">
  import type { Enums } from '~/types/database.types';

  defineProps<{
    topoCondition: Enums<'topo_condition'>;
  }>();

  const conditionMap: Record<Enums<'topo_condition'>, string> = {
    as_good_as_new: 'New',
    good: 'Good',
    used: 'Used',
    damaged: 'Damaged',
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
    {{ conditionMap[topoCondition] }}
  </span>
</template>
