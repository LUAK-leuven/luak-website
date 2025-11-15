<script setup lang="ts">
  import * as yup from 'yup';

  export type Option = {
    label: string;
    value: unknown;
  };

  const props = defineProps({
    label: {
      type: String,
      default: 'text',
    },
    options: {
      type: Array<Option>,
      required: true,
    },
    placeholder: {
      type: String,
      default: 'text',
    },
    error: {
      type: String,
      default: '',
    },
  });

  const value = defineModel<unknown>();

  const { values, defineField, meta, setFieldValue } = useForm({
    validationSchema: toTypedSchema(
      yup.object({
        option: yup
          .string()
          .required()
          .oneOf(props.options.map((option) => option.label)),
      }),
    ),
  });
  const [optionValue] = defineField('option');

  effect(() => {
    if (!meta.value.valid) value.value = undefined;
  });
  const filteredOptions: ComputedRef<Option[]> = computed(() => {
    const txt = values.option;
    const fOptions =
      txt === undefined
        ? props.options
        : props.options.filter((option) => option.label.includes(txt));
    return fOptions.slice(0, 5);
  });

  const hidden = ref(true);

  function onSelect(option: Option) {
    setFieldValue('option', option.label);
    value.value = option.value;
    hidden.value = true;
  }
  function onFocus() {
    optionValue.value = '';
    hidden.value = false;
  }
</script>

<template>
  <label class="form-control w-full mb-2 peer">
    <div class="label">
      <span class="label-text">{{ label }}</span>
    </div>
    <input
      v-model="optionValue"
      class="input input-bordered w-full"
      type="text"
      :placeholder="placeholder"
      popovertarget="popover-1"
      style="anchor-name: --anchor-1"
      @focus="onFocus()" />
    <span class="text-error">{{ error }}</span>
  </label>

  <ul
    id="popover-1"
    class="dropdown menu w-52 rounded-box bg-base-100 shadow-md"
    :class="hidden ? 'hidden' : ''"
    popover
    style="position-anchor: --anchor-1">
    <li v-for="option in filteredOptions" :key="option.label">
      <button @click="onSelect(option)">{{ option.label }}</button>
    </li>
  </ul>
</template>
