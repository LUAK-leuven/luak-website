<script setup lang="ts">
  const {
    data: topos,
    pending: isLoading,
    error,
  } = await gearService().getTopoLibrary();

  const allTypesOfClimbing = computed(() =>
    [...new Set(topos.value?.flatMap((it) => it.types_of_climbing))].toSorted(),
  );
  const allCountries = computed(() =>
    [...new Set(topos.value?.flatMap((it) => it.countries))].toSorted(),
  );

  const searchTerm = ref<string>();
  const selectedTypesOfClimbing = ref<string[]>([]);
  const selectedCountries = ref<string[]>([]);

  const filteredTopos = computed(() => {
    return (
      topos.value
        ?.filter((topo) => {
          const matchesSearch = !!fuzzySearch(topo.title, searchTerm.value);
          const matchesTypesOfClimbing = matchAny(
            topo.types_of_climbing,
            selectedTypesOfClimbing.value,
          );
          const matchesCountries = matchAny(
            topo.countries,
            selectedCountries.value,
          );
          return matchesSearch && matchesTypesOfClimbing && matchesCountries;
        })
        .sort((a, b) => {
          return a.title.localeCompare(b.title);
        }) ?? []
    );
  });
</script>
<template>
  <FullPageCard>
    <template #title>Topo Library</template>

    <!-- Loading state -->
    <div v-if="isLoading" class="flex justify-center items-center py-10">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <!-- Error message -->
    <div v-else-if="error || topos === null" class="alert alert-error">
      <span>ERROR: {{ error }}!</span>
    </div>

    <!-- Data display -->
    <div v-else>
      <!-- Filters -->
      <div class="flex flex-col md:flex-row gap-4 mb-6">
        <InputText2
          v-model="searchTerm"
          label="Search by title"
          type="text"
          placeholder="Search by title">
        </InputText2>
      </div>

      <Collapsable>
        <template #title>
          <div class="flex flex-row items-center gap-2">
            Filters
            <span class="material-symbols-outlined">filter_alt</span>
          </div>
        </template>
        <template #content>
          <div class="flex flex-col">
            <span class="font-bold">Type(s) of climbing:</span>
            <div class="flex flex-row flex-wrap gap-x-1 gap-y-1">
              <InputSelectableBadge
                v-for="typeOfClimbing of allTypesOfClimbing"
                :key="typeOfClimbing"
                :text="typeOfClimbing"
                @update:model-value="
                  (value) => {
                    if (value) selectedTypesOfClimbing.push(typeOfClimbing);
                    else
                      selectedTypesOfClimbing = selectedTypesOfClimbing.filter(
                        (it) => it !== typeOfClimbing,
                      );
                  }
                ">
              </InputSelectableBadge>
            </div>
            <span class="font-bold">Countries:</span>
            <TopoLibrarySearchableSelect
              v-model="selectedCountries"
              :options="allCountries"
              placeholder="Select country">
            </TopoLibrarySearchableSelect>
          </div>
        </template>
      </Collapsable>

      <!-- Table -->
      <div class="overflow-x-auto max-w-[80vw]">
        <table class="table table-zebra">
          <thead>
            <tr>
              <th>Title</th>
              <th>Year</th>
              <th>Countries</th>
              <th>Amount</th>
              <th>Type(s) of climbing</th>
              <th>Languages</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="topo in filteredTopos" :key="topo.id">
              <td>{{ topo.title }}</td>
              <td>{{ topo.year_published }}</td>
              <td>{{ topo.countries.join(', ') }}</td>
              <td>
                {{ topo.amount }}
              </td>
              <td>
                {{ topo.types_of_climbing.join(', ') }}
              </td>
              <td>
                {{ topo.languages.join(', ') }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- No results message -->
      <!-- <div v-if="filteredSubscriptions.length === 0" class="text-center py-10">
        <p>No subscriptions found matching your criteria.</p>
      </div> -->
    </div>
  </FullPageCard>
</template>
