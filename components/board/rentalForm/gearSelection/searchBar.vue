<script setup lang="ts">
  const props = defineProps<{
    availableGear: {
      name: string;
      availableAmount: number;
    }[];
  }>();

  const emit = defineEmits<{
    onSelect: [gearItemId: string];
  }>();

  const filterGear = (searchTerm: string | undefined) => {
    if (searchTerm === undefined) return props.availableGear;
    return props.availableGear
      .map(
        (gearItem) =>
          [gearItem, fuzzySearch(gearItem.name, searchTerm)] as const,
      )
      .filter((x) => x[1] > 0)
      .sort((a, b) => b[1] - a[1])
      .map((x) => x[0]);
  };

  const addSelection = (item: { name: string; availableAmount: number }) => {
    emit('onSelect', item.name);
  };
</script>
<template>
  <InputSearchableSelect
    placeholder="Search gear to add ..."
    :options-provider="filterGear"
    @on-select="addSelection">
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
