<script setup lang="ts">
  const props = defineProps<{
    content: string;
  }>();

  const { data } = await useAsyncData(props.content, () =>
    queryCollection('shared').where('id', 'LIKE', `%${props.content}%`).first(),
  );
</script>

<template>
  <ContentRenderer v-if="data" :value="data.meta" />
</template>
