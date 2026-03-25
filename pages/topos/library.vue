<script setup lang="ts">
  const { data: user } = await useLuakMember();
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
  const allTags = computed(() => [
    ...new Set(topos.value?.flatMap((it) => it.tags)),
  ]);

  const searchTerm = ref<string>();
  const selectedTypesOfClimbing = ref<string[]>([]);
  const selectedCountries = ref<string[]>([]);

  const matchedTags = computed(() =>
    searchInArray(allTags.value, searchTerm.value),
  );

  const filteredTopos = computed(() => {
    return (
      topos.value
        ?.filter((topo) => {
          const matchesSearch = !!fuzzySearch(topo.title, searchTerm.value);
          const matchesTags = matchAny(topo.tags, matchedTags.value);
          const matchesTypesOfClimbing =
            selectedTypesOfClimbing.value.length == 0 ||
            matchAny(topo.types_of_climbing, selectedTypesOfClimbing.value);
          const matchesCountries =
            selectedCountries.value.length == 0 ||
            matchAny(topo.countries, selectedCountries.value);
          return (
            (matchesSearch || matchesTags) &&
            matchesTypesOfClimbing &&
            matchesCountries
          );
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
      <Collapsable class="mt-0" open>
        <template #title>
          <div class="flex flex-row items-center gap-2">
            Filters
            <span class="material-symbols-outlined">filter_alt</span>
          </div>
        </template>
        <template #content>
          <div class="flex flex-col">
            <span class="font-bold">Search:</span>
            <InputText2
              v-model="searchTerm"
              type="text"
              placeholder="Search by title">
            </InputText2>
            <span class="font-bold mt-3">Type(s) of climbing:</span>
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
            <span class="font-bold mt-3">Countries:</span>
            <TopoLibrarySearchableSelect
              v-model="selectedCountries"
              :options="allCountries"
              placeholder="Select country">
            </TopoLibrarySearchableSelect>
          </div>
        </template>
      </Collapsable>

      <!-- <div>Matched tags: {{ matchedTags }}</div> -->
      <div>
        <p>Found {{ filteredTopos.length }} out of {{ topos.length }} topos.</p>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto max-w-[80vw]">
        <table class="table table-zebra">
          <thead>
            <tr>
              <th>Title</th>
              <th v-if="user.isBoard">Place in library</th>
              <th>Year</th>
              <th>Countries</th>
              <th>Type(s) of climbing</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="topo in filteredTopos" :key="topo.id">
              <td>
                <NuxtLink :to="`/topos/${topo.id}`">
                  <div class="flex flex-row gap-1 items-center">
                    <span class="">{{ topo.title }}</span>
                    <span class="material-symbols-outlined text-lg">
                      open_in_new
                    </span>
                  </div>
                </NuxtLink>
              </td>
              <td v-if="user.isBoard">{{ topo.place_in_library }}</td>
              <td>{{ topo.year_published }}</td>
              <td>{{ topo.countries.join(', ') }}</td>
              <td>
                {{ topo.types_of_climbing.join(', ') }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- No results message -->
      <div v-if="filteredTopos.length === 0" class="text-center pt-8">
        <p>No subscriptions found matching your criteria.</p>
      </div>

      <!-- <div>
        <p>topos: {{ topos.length }}</p>
        <p>pending: {{ isLoading }}</p>
        <p>error: {{ error }}</p>
      </div> -->
    </div>
  </FullPageCard>
</template>
