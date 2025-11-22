<script setup lang="ts" generic="T">
  const props = defineProps<{
    options: T[];
    placeholder: string;
    optionsSelectFn: (options: T[], input: string | undefined) => T[];
    showSelectedItem?: boolean;
  }>();

  const model = defineModel<T | undefined>({
    required: true,
  });

  const textValue = ref<string>();
  const hidden = ref(true);

  const selectedOptions = computed(() => {
    return props.optionsSelectFn(props.options, textValue.value);
  });

  // function closeSelection(e: Event) {
  //   e.stopImmediatePropagation();
  //   console.log('hide');
  //   hidden.value = true;
  // }
  // watch(hidden, (hidden_new) => {
  //   if (!hidden_new) {
  //     console.log('add');
  //     window.addEventListener('click', closeSelection, { once: true });
  //   }
  // });

  function onSelect(option: T) {
    hidden.value = true;
    model.value = option;
  }
  function onFocus() {
    textValue.value = '';
    hidden.value = false;
    model.value = undefined;
  }
</script>

<template>
  <label class="input input-bordered flex w-full mb-2">
    <span v-if="model && showSelectedItem" class="label w-fit">
      <slot name="item" :data="model" />
    </span>
    <input
      v-model="textValue"
      :class="model ? 'w-0' : ''"
      type="text"
      :placeholder="placeholder"
      popovertarget="popover-1"
      style="anchor-name: --anchor-1"
      @focus="onFocus()"
      @dblclick="hidden = true" />
  </label>

  <div class="relative">
    <ul
      id="popover-1"
      class="absolute dropdown menu w-52 rounded-box bg-base-100 shadow-md gap-y-1 z-10"
      :class="hidden ? 'hidden' : ''"
      popover
      style="position-anchor: --anchor-1">
      <li
        v-for="(option, idx) in selectedOptions"
        :key="idx"
        class="hover:opacity-60">
        <button class="grid-cols-1 p-0" @click="onSelect(option)">
          <slot name="item" :data="option" />
        </button>
      </li>
      <li v-if="selectedOptions.length === 0">
        <div>No results found</div>
      </li>
    </ul>
  </div>
</template>
