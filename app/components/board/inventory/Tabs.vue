<script lang="ts" setup generic="T extends string">
  import Button from '~/components/shared/Button.vue';

  defineProps<{
    tabs: readonly { id: T; title: string }[];
  }>();

  const activeTab = defineModel<T>('activeTab', { required: true });
</script>

<template>
  <!-- The 4px active bar overlaps the 2px container line (-mb-0.5).
         Negative top margin pulls the bar up into the card's top padding. -->
  <div
    class="-mt-4 flex w-full border-b-2 border-base-300 sm:-mt-6 mb-4"
    role="tablist">
    <Button
      v-for="tabOption of tabs"
      :key="tabOption.id"
      class="flex-1 py-2 text-lg font-semibold border-b-4 -mb-0.5"
      :class="
        activeTab === tabOption.id
          ? 'border-primary'
          : 'border-transparent opacity-60'
      "
      role="tab"
      type="button"
      @click="activeTab = tabOption.id">
      {{ tabOption.title }}
    </Button>
  </div>
</template>
