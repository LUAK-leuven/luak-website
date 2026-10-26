<script setup lang="ts">
  import type { Country } from '#shared/api/rest/topo';

  const props = defineProps<{
    options: Country[];
    placeholder: string;
  }>();
  const selected = defineModel<Country[]>({ default: () => [] as Country[] });

  const filteredOptions = (searchTerm: string | undefined) =>
    props.options
      .filter((it) => !selected.value.includes(it))
      .filter((it) => search(it, searchTerm));

  const addSelection = (value: string) => {
    selected.value = [...selected.value, value as Country];
  };
  const removeSelection = (value: Country) => {
    selected.value = selected.value.filter((it) => it !== value);
  };
</script>

<template>
  <InputSearchableSelect
    :options-provider="filteredOptions"
    :placeholder="placeholder"
    @on-select="addSelection">
    <template #item="{ data }">
      <div class="flex flex-row justify-start w-full">
        <span class="badge badge-info badge-lg"> {{ data }}</span>
      </div>
    </template>
  </InputSearchableSelect>
  <div class="flex flex-row flex-wrap gap-x-1 gap-y-1">
    <span
      v-for="it of selected"
      :key="it"
      class="badge badge-lg badge-success border border-neutral"
      :data-testId="`country.${it}`">
      {{ it }}
      <button class="btn btn-ghost btn-xs" @click="() => removeSelection(it)">
        ❌
      </button>
    </span>
  </div>
</template>
