<script setup lang="ts">
defineProps<{ image: string }>();
</script>
<template>
  <div class="card w-full max-w-96 bg-base-100 shadow-xl image-full my-5">
    <figure>
      <NuxtImg :src="image" />
    </figure>
    <div class="card-body">
      <h2 class="card-title">
        <slot name="title" />
      </h2>
      <p>
        <slot name="description" />
      </p>
      <div class="card-actions justify-end">
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>
