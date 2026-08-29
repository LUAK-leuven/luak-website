<script setup lang="ts">
  import { useField } from 'vee-validate';

  const props = defineProps<{
    name: string;
  }>();

  const { value, errorMessage } = useField<boolean>(() => props.name);
</script>

<template>
  <div>
    <div class="my-5 flex content-center">
      <span class="mr-3">
        <slot />
      </span>
      <SharedInputBool v-model="value" class="checkbox" />
    </div>
    <span class="text-error">{{ errorMessage }}</span>
  </div>
</template>
