<script setup lang="ts" generic="T">
  const props = withDefaults(
    defineProps<{
      label?: string;
      options: T[] | undefined;
      placeholder: string;
      searchFn: (options: T[], input: string | undefined) => T[];
      selectedItem?: T;
      errorMessage?: string;
      loadingMessage?: string;
      disable?: boolean;
    }>(),
    {
      label: undefined,
      loadingMessage: 'Loading',
      selectedItem: undefined,
      errorMessage: undefined,
      disable: false,
    },
  );

  const emit = defineEmits<{
    selected: [value: T];
  }>();

  const textValue = ref<string>();
  const hidden = ref(true);
  const mouseOnSelection = ref(false);

  const filteredOptions = computed(() => {
    return props.options === undefined
      ? undefined
      : props.searchFn(props.options, textValue.value);
  });

  function onSelect(option: T) {
    hidden.value = true;
    emit('selected', option);
  }

  function onFocus() {
    textValue.value = '';
    hidden.value = false;
  }
</script>

<template>
  <div class="form-control w-full mb-2">
    <div v-if="label" class="label">
      <span class="label-text">{{ label }}</span>
    </div>
    <label
      class="input input-bordered flex w-full dropdown"
      :class="{ 'bg-gray-300': disable }">
      <span v-if="hidden && selectedItem !== undefined" class="label w-max">
        <slot name="item" :data="selectedItem" />
      </span>
      <input
        v-model="textValue"
        :class="{
          'w-0': hidden && selectedItem !== undefined,
        }"
        tabindex="0"
        type="text"
        :placeholder="placeholder"
        :disabled="disable"
        @focus="onFocus()"
        @blur="if (!mouseOnSelection) hidden = true;" />

      <ul
        class="dropdown-content menu w-fit max-h-52 overflow-scroll rounded-box bg-base-100 shadow-md gap-y-1 top-12 z-10 flex-nowrap border-8 p-0 border-base-100"
        :class="hidden ? 'hidden' : ''"
        tabindex="0"
        @mouseenter="mouseOnSelection = true"
        @mouseleave="mouseOnSelection = false">
        <li v-if="filteredOptions === undefined">
          <div>
            {{ loadingMessage }} <span class="loading loading-dots"></span>
          </div>
        </li>
        <template v-else>
          <li
            v-for="(option, idx) in filteredOptions"
            :key="idx"
            class="hover:opacity-60">
            <button
              class="grid-cols-1 p-0"
              type="button"
              @click="onSelect(option)">
              <slot name="item" :data="option" />
            </button>
          </li>
          <li v-if="filteredOptions.length === 0">
            <div>No results found</div>
          </li>
        </template>
      </ul>
    </label>
    <span v-if="errorMessage" class="text-error">{{ errorMessage }}</span>
  </div>
</template>
