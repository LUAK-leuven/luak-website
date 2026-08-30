<script setup lang="ts">
  import Text from '~/components/input/Text.vue';
  import { string as yupString } from 'yup';
  import SelectCountry from '~/components/topoLibrary/SelectCountry.vue';
  import SelectableBadge from '~/components/input/SelectableBadge.vue';
  import { refDebounced } from '@vueuse/core';
  import { asArray } from '~/utils/QueryParams';

  definePageMeta({ middleware: 'active-member-guard' });

  const user = await useUserService().getMembershipInfo();
  const {
    data: topos,
    pending,
    error,
  } = await useLazyFetch(`/api/topos/library`, { method: 'get' });

  const allTypesOfClimbing = computed(() =>
    [...new Set(topos.value?.flatMap((it) => it.typesOfClimbing))].toSorted(),
  );
  const allCountries = computed(() =>
    [...new Set(topos.value?.flatMap((it) => it.countries))].toSorted(),
  );
  const allTags = computed(() => [
    ...new Set(topos.value?.flatMap((it) => it.tags)),
  ]);

  const searchInput = useUrlState<string | undefined>('search', (x) =>
    yupString().optional().validateSync(x),
  );
  const searchTerm = refDebounced(searchInput, 250);

  const selectedTypesOfClimbing = useUrlState<string[]>('type', (x) => {
    return asArray(x).filter(
      (it) => it !== null && allTypesOfClimbing.value.includes(it),
    ) as string[];
  });
  const selectedCountries = useUrlState<string[]>('country', (x) => {
    return asArray(x).filter(
      (it) => it !== null && allCountries.value.includes(it),
    ) as string[];
  });
  const _includeOldTopos = useUrlState<null | undefined>('old', (x) => {
    if (x === undefined) return undefined;
    else return null;
  });
  const includeOldTopos = computed(() => _includeOldTopos.value === null);
  const setIncludeOldTopos = (value: boolean) => {
    if (value) _includeOldTopos.value = null;
    else _includeOldTopos.value = undefined;
  };

  const matchedTags = computed(() =>
    searchInArray(allTags.value, searchTerm.value),
  );

  const filteredTopos_ = computed(() => {
    return topos.value
      ?.filter((topo) => {
        const matchesSearch = !!fuzzySearch(topo.title, searchTerm.value);
        const matchesTags = matchAny(topo.tags, matchedTags.value);
        const matchesTypesOfClimbing =
          selectedTypesOfClimbing.value.length == 0 ||
          matchAny(topo.typesOfClimbing, selectedTypesOfClimbing.value);
        const matchesCountries =
          selectedCountries.value.length == 0 ||
          matchAny(topo.countries, selectedCountries.value);
        const matchesOldTopos =
          includeOldTopos.value ||
          !(
            topo.placeInLibrary === 'Oude doos - oud papier' ||
            topo.placeInLibrary === 'Old/Inspiration' ||
            topo.placeInLibrary === 'Oude doos'
          );
        return (
          (matchesSearch || matchesTags) &&
          matchesTypesOfClimbing &&
          matchesCountries &&
          matchesOldTopos
        );
      })
      .sort((a, b) => {
        return a.title.localeCompare(b.title);
      });
  });
</script>

<template>
  <FullPageCard>
    <template #title>Topo Library</template>

    <PagesWithLazyResource
      v-slot="{ data: filteredTopos }"
      :data="filteredTopos_"
      :is-loading="pending"
      :error="error?.message">
      <div>
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
              <Text
                v-model="searchInput"
                type="text"
                placeholder="Search by title"
                data-testId="search-input">
              </Text>
              <span class="font-bold mt-3">Type(s) of climbing:</span>
              <div class="flex flex-row flex-wrap gap-x-1 gap-y-1">
                <SelectableBadge
                  v-for="typeOfClimbing of allTypesOfClimbing"
                  :key="typeOfClimbing"
                  :text="typeOfClimbing"
                  :model-value="
                    selectedTypesOfClimbing.some((x) => x === typeOfClimbing)
                  "
                  :data-testId="`toc.${typeOfClimbing}`"
                  @update:model-value="
                    (value) => {
                      if (value)
                        selectedTypesOfClimbing = [
                          ...selectedTypesOfClimbing,
                          typeOfClimbing,
                        ];
                      else
                        selectedTypesOfClimbing =
                          selectedTypesOfClimbing.filter(
                            (it) => it !== typeOfClimbing,
                          );
                    }
                  " />
              </div>
              <span class="font-bold mt-3">Countries:</span>
              <SelectCountry
                v-model="selectedCountries"
                :options="allCountries"
                placeholder="Select country">
              </SelectCountry>
              <div class="flex flex-row items-center gap-2 mt-3">
                <span class="font-bold">Include old topos:</span>
                <SharedInputBool
                  class="toggle toggle-lg toggle-primary"
                  :model-value="includeOldTopos"
                  @update:model-value="setIncludeOldTopos" />
              </div>
            </div>
          </template>
        </Collapsable>

        <p>
          Found {{ filteredTopos.length }} out of {{ topos!.length }} topos.
        </p>

        <div class="overflow-x-auto max-w-[80vw]">
          <table class="table table-zebra">
            <thead>
              <tr>
                <th>Title</th>
                <th v-if="user.permissions.boardSection">Place in library</th>
                <th>Year</th>
                <th>Countries</th>
                <th>Type(s) of climbing</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="topo in filteredTopos"
                :key="topo.id"
                :data-testId="`topo-${topo.title}`">
                <td>
                  <NuxtLink :to="{ name: 'topos-id', params: { id: topo.id } }">
                    <div class="flex flex-row gap-1 items-center">
                      <span class="">{{ topo.title }}</span>
                      <span class="material-symbols-outlined text-lg">
                        open_in_new
                      </span>
                    </div>
                  </NuxtLink>
                </td>
                <td v-if="user.permissions.boardSection">
                  {{ topo.placeInLibrary }}
                </td>
                <td>{{ topo.yearPublished }}</td>
                <td>{{ topo.countries.join(', ') }}</td>
                <td>
                  {{ topo.typesOfClimbing.join(', ') }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="filteredTopos.length === 0" class="text-center pt-8">
          <p>No topos found matching your criteria.</p>
        </div>
      </div>
    </PagesWithLazyResource>
  </FullPageCard>
</template>
