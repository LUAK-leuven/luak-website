<script setup lang="ts" generic="T extends EntityId<unknown>">
  import type { EntityId } from '~/types/ddd';

  const props = defineProps<{
    availableItems: {
      id: T;
      name: string;
      availableAmount: number;
    }[];
    placeholder: string;
  }>();

  const emit = defineEmits<{
    onSelect: [itemId: T];
  }>();

  const filterItemsByName = (searchTerm: string | undefined) => {
    if (searchTerm === undefined) return props.availableItems;
    return props.availableItems
      .map((it) => [it, fuzzySearch(it.name, searchTerm)] as const)
      .filter((it) => it[1] > 0)
      .sort((a, b) => b[1] - a[1])
      .map((it) => it[0]);
  };
</script>
<template>
  <InputSearchableSelect
    :placeholder="placeholder"
    :options-provider="filterItemsByName"
    @on-select="(item) => emit('onSelect', item.id)">
    <template #item="{ data }">
      <div
        class="px-3 py-2 rounded-md w-full flex flex-row justify-between gap-6 shadow-sm"
        :class="
          data.availableAmount === 0
            ? 'bg-red-100'
            : data.availableAmount < 0
              ? 'bg-yellow-300'
              : 'bg-base-100'
        ">
        <span>{{ data.availableAmount < 0 ? '⚠️ ' : '' }}{{ data.name }}</span>
        <span>{{ data.availableAmount }}</span>
      </div>
    </template>
  </InputSearchableSelect>
</template>
