<script lang="ts" setup>
  import GearOverview from '~/components/board/inventory/GearOverview.vue';
  import Tabs from '~/components/board/inventory/Tabs.vue';
  import ToposOverview from '~/components/board/inventory/ToposOverview.vue';
  import BackButton from '~/components/shared/BackButton.vue';

  type Tab = 'gear' | 'topos';

  const tabs: { id: Tab; title: string }[] = [
    { id: 'gear', title: 'Gear' },
    { id: 'topos', title: 'Topos' },
  ];

  const activeTab = ref<Tab>('gear');
</script>

<template>
  <FullPageCard>
    <template #title>Inventory</template>

    <BackButton
      class="relative top-[-4.5rem] sm:top-[-5rem] left-[-1rem]"
      :to="{ name: 'board' }" />

    <Tabs v-model:active-tab="activeTab" :tabs="tabs" />

    <GearOverview v-if="activeTab === 'gear'" />
    <ToposOverview v-if="activeTab === 'topos'" />
  </FullPageCard>
</template>
