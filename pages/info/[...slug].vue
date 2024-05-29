<template>
  <main>
    <ContentDoc v-slot="{ doc }">
      <FullPageCard>
        <template #title>
          {{ doc.title }}
        </template>
        <ContentRenderer :value="doc" />
      </FullPageCard>
    </ContentDoc>
  </main>
</template>
