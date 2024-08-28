<template>
  <main>
    <ContentDoc v-slot="{ doc }">
      <FullPageCard>
        <template #title>
          {{ doc.title }}
        </template>
        <ContentRenderer :value="doc" class="nuxt-content w-full" />
      </FullPageCard>
    </ContentDoc>
  </main>
</template>
