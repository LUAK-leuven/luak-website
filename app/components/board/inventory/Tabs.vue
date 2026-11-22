<script lang="ts" setup generic="T extends string">
  import Button from '~/components/shared/Button.vue';

  defineProps<{
    tabs: readonly { id: T; title: string }[];
  }>();

  const activeTab = defineModel<T>('activeTab', { required: true });
</script>

<template>
  <div class="tabs" role="tablist">
    <Button
      v-for="tabOption of tabs"
      :key="tabOption.id"
      class="tab tab-bordered tab-lg flex-grow"
      :class="{ 'tab-active': activeTab === tabOption.id }"
      role="tab"
      type="button"
      @click="activeTab = tabOption.id">
      {{ tabOption.title }}
    </Button>
  </div>
</template>
