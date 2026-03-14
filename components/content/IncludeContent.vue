<script setup lang="ts">
  const props = defineProps<{
    content: string;
  }>();

  const { data } = await useAsyncData(props.content, () =>
    queryCollection('shared').path(`/shared/${props.content}`).first(),
  );
</script>

<template>
  <ContentRenderer v-if="data" :value="data" />
</template>
