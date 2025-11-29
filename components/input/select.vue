<script
  setup
  lang="ts"
  generic="
    Options extends readonly {
      value: string;
      label: string;
    }[]
  ">
  defineProps<{
    name: string;
    options: Options;
    defaultOption?: Options[number]['value'];
    disabledOption?: string;
  }>();
</script>

<template>
  <Field
    class="select select-bordered w-full max-w-xs mb-2"
    :name="name"
    as="select">
    <option
      v-if="disabledOption"
      disabled
      :selected="defaultOption === undefined">
      {{ disabledOption }}
    </option>
    <option
      v-for="{ value, label } in options"
      :key="value"
      :value="value"
      :selected="value === defaultOption">
      {{ label }}
    </option>
  </Field>
  <ErrorMessage class="text-error" name="select" />
</template>
