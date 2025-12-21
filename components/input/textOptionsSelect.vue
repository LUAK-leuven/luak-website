<script setup lang="ts" generic="T">
  const props = defineProps<{
    label?: string;
    options: T[];
    placeholder: string;
    searchFn: (options: T[], input: string | undefined) => T[];
    showSelectedItem?: boolean;
    errorMessage?: string;
  }>();

  const emit = defineEmits<{
    selected: [value: T];
  }>();

  const textValue = ref<string>();
  const hidden = ref(true);
  const mouseOnSelection = ref(false);

  const filteredOptions = computed(() => {
    return props.searchFn(props.options, textValue.value);
  });

  const selectedOption = ref<T>();

  function onSelect(option: T) {
    hidden.value = true;
    emit('selected', option);
    selectedOption.value = option;
  }

  function onFocus() {
    textValue.value = '';
    hidden.value = false;
    selectedOption.value = undefined;
  }
</script>

<template>
  <div class="form-control w-full mb-2">
    <div v-if="label" class="label">
      <span class="label-text">{{ label }}</span>
    </div>
    <label class="input input-bordered flex w-full relative">
      <span v-if="selectedOption && showSelectedItem" class="label w-fit">
        <slot name="item" :data="selectedOption" />
      </span>
      <input
        v-model="textValue"
        :class="selectedOption && showSelectedItem ? 'w-0' : ''"
        type="text"
        :placeholder="placeholder"
        popovertarget="popover-1"
        style="anchor-name: --anchor-1"
        @focus="onFocus()"
        @blur="if (!mouseOnSelection) hidden = true;" />

      <ul
        id="popover-1"
        class="absolute dropdown menu w-52 rounded-box bg-base-100 shadow-md gap-y-1 top-12 z-10"
        :class="hidden ? 'hidden' : ''"
        popover
        style="position-anchor: --anchor-1"
        @mouseenter="mouseOnSelection = true"
        @mouseleave="mouseOnSelection = false">
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
      </ul>
    </label>
    <span v-if="errorMessage" class="text-error">{{ errorMessage }}</span>
  </div>
</template>
