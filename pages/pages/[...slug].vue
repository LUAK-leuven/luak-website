<template>
  <main>
    <ContentDoc v-slot="{ doc }">
      <FullPageCard>
        <template #title>
          {{ doc.title }}
        </template>
        <ContentRenderer class="nuxt-content w-full" :value="doc" />
      </FullPageCard>
    </ContentDoc>
  </main>
</template>
